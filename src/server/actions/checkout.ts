'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/session';
import { canPurchaseModule } from '@/server/services/module-state';
import { getBundleInfo, type BundleInfo } from '@/server/services/bundle';
import { getPaymentProvider } from '@/server/payments';
import { ensureAsaasCustomer } from '@/server/payments/checkout';

type PixResult =
  | {
      ok: true;
      purchaseId: string;
      qrCodeBase64: string;
      copyPaste: string;
      expirationDate: string;
    }
  | { ok: false; error: string };

type BoletoResult =
  { ok: true; purchaseId: string; invoiceUrl: string } | { ok: false; error: string };

type CardResult = { ok: true; purchaseId: string } | { ok: false; error: string };

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

async function prepareCheckout(
  userId: string,
  moduleId: string,
): Promise<
  | { error: string }
  | { module: { id: string; title: string; courseId: string; priceCents: number } }
> {
  const check = await canPurchaseModule(userId, moduleId);
  if (!check.ok) return { error: check.reason };

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, title: true, courseId: true, priceCents: true },
  });
  if (!module) return { error: 'Módulo não encontrado' };

  // Defesa em profundidade: nunca permitir checkout de módulo já desbloqueado
  // (a UI esconde o botão, mas a action também pode ser chamada diretamente).
  const existing = await prisma.studentPurchase.findFirst({
    where: { userId, moduleId, statusPayment: 'PAID' },
    select: { id: true },
  });
  if (existing) return { error: 'Módulo já desbloqueado' };

  return { module };
}

async function upsertPendingPurchase(
  userId: string,
  moduleId: string,
  paymentId: string,
  invoiceUrl: string,
  paymentMethod: string,
) {
  return prisma.studentPurchase.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: {
      statusPayment: 'PENDING',
      externalId: paymentId,
      invoiceUrl,
      paymentMethod,
    },
    create: {
      userId,
      moduleId,
      statusPayment: 'PENDING',
      externalId: paymentId,
      invoiceUrl,
      paymentMethod,
    },
  });
}

function revalidateCoursePaths(courseId: string, moduleId: string) {
  revalidatePath('/dashboard');
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/modules/${moduleId}`);
}

export async function createPixPaymentAction(moduleId: string): Promise<PixResult> {
  const user = await requireAuth();
  const prep = await prepareCheckout(user.id, moduleId);
  if ('error' in prep) return { ok: false, error: prep.error };

  const { module } = prep;
  const provider = getPaymentProvider();
  const customerId = await ensureAsaasCustomer(user);

  const payment = await provider.createPayment({
    customerId,
    billingType: 'PIX',
    value: module.priceCents / 100,
    dueDate: tomorrow(),
    description: `Módulo: ${module.title}`,
    externalReference: module.id,
  });

  const qr = await provider.getPixQrCode(payment.id);
  const purchase = await upsertPendingPurchase(
    user.id,
    moduleId,
    payment.id,
    payment.invoiceUrl,
    'PIX',
  );

  revalidateCoursePaths(module.courseId, moduleId);

  return {
    ok: true,
    purchaseId: purchase.id,
    qrCodeBase64: qr.encodedImage,
    copyPaste: qr.payload,
    expirationDate: qr.expirationDate,
  };
}

export async function createBoletoPaymentAction(moduleId: string): Promise<BoletoResult> {
  const user = await requireAuth();
  const prep = await prepareCheckout(user.id, moduleId);
  if ('error' in prep) return { ok: false, error: prep.error };

  const { module } = prep;
  const provider = getPaymentProvider();
  const customerId = await ensureAsaasCustomer(user);

  const payment = await provider.createPayment({
    customerId,
    billingType: 'BOLETO',
    value: module.priceCents / 100,
    dueDate: tomorrow(),
    description: `Módulo: ${module.title}`,
    externalReference: module.id,
  });

  const purchase = await upsertPendingPurchase(
    user.id,
    moduleId,
    payment.id,
    payment.invoiceUrl,
    'BOLETO',
  );

  revalidateCoursePaths(module.courseId, moduleId);

  return { ok: true, purchaseId: purchase.id, invoiceUrl: payment.invoiceUrl };
}

export async function createCreditCardPaymentAction(
  moduleId: string,
  formData: FormData,
): Promise<CardResult> {
  const user = await requireAuth();
  const prep = await prepareCheckout(user.id, moduleId);
  if ('error' in prep) return { ok: false, error: prep.error };

  const holderName = String(formData.get('holderName') ?? '').trim();
  const number = String(formData.get('number') ?? '').replace(/\D/g, '');
  const expiry = String(formData.get('expiry') ?? '').trim();
  const ccv = String(formData.get('ccv') ?? '').trim();
  const cpfCnpj = String(formData.get('cpfCnpj') ?? '').replace(/\D/g, '');
  const phone = String(formData.get('phone') ?? '').replace(/\D/g, '');
  const postalCode = String(formData.get('postalCode') ?? '').replace(/\D/g, '');
  const addressNumber = String(formData.get('addressNumber') ?? '').trim();

  const m = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (
    !holderName ||
    number.length < 13 ||
    !m ||
    ccv.length < 3 ||
    cpfCnpj.length < 11 ||
    phone.length < 10 ||
    postalCode.length !== 8 ||
    !addressNumber
  ) {
    return { ok: false, error: 'Dados do cartão incompletos ou inválidos' };
  }

  const { module } = prep;
  const provider = getPaymentProvider();
  const customerId = await ensureAsaasCustomer(user);

  // Os dados do cartão são usados apenas nesta chamada e jamais persistidos.
  const payment = await provider.createPayment({
    customerId,
    billingType: 'CREDIT_CARD',
    value: module.priceCents / 100,
    dueDate: tomorrow(),
    description: `Módulo: ${module.title}`,
    externalReference: module.id,
    creditCard: {
      holderName,
      number,
      expiryMonth: m[1],
      expiryYear: `20${m[2]}`,
      ccv,
    },
    creditCardHolderInfo: {
      name: holderName,
      email: user.email ?? '',
      cpfCnpj,
      phone,
      postalCode,
      addressNumber,
    },
  });

  const approved = payment.status === 'CONFIRMED' || payment.status === 'RECEIVED';

  await prisma.studentPurchase.upsert({
    where: { userId_moduleId: { userId: user.id, moduleId } },
    update: {
      statusPayment: approved ? 'PAID' : 'PENDING',
      purchasedAt: approved ? new Date() : null,
      externalId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      paymentMethod: 'CREDIT_CARD',
    },
    create: {
      userId: user.id,
      moduleId,
      statusPayment: approved ? 'PAID' : 'PENDING',
      purchasedAt: approved ? new Date() : null,
      externalId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      paymentMethod: 'CREDIT_CARD',
    },
  });

  revalidateCoursePaths(module.courseId, moduleId);

  if (!approved) {
    return { ok: false, error: `Pagamento não aprovado (status: ${payment.status})` };
  }

  return { ok: true, purchaseId: payment.id };
}

export async function getPaymentStatusAction(
  purchaseId: string,
): Promise<{ status: string } | { ok: false; error: string }> {
  const user = await requireAuth();

  const purchase = await prisma.studentPurchase.findFirst({
    where: { id: purchaseId, userId: user.id },
  });
  if (!purchase) return { ok: false, error: 'Compra não encontrada' };

  if (purchase.statusPayment === 'PAID') {
    return { status: 'PAID' };
  }
  if (!purchase.externalId) {
    return { status: purchase.statusPayment };
  }

  const provider = getPaymentProvider();
  const payment = await provider.getPayment(purchase.externalId);

  if (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED') {
    // Todas as compras que compartilham este externalId (ex.: compra em
    // bundle, 1 pagamento = N módulos) são marcadas de uma vez.
    await prisma.studentPurchase.updateMany({
      where: { externalId: purchase.externalId, statusPayment: { not: 'PAID' } },
      data: { statusPayment: 'PAID', purchasedAt: new Date() },
    });
    const module = await prisma.module.findUnique({
      where: { id: purchase.moduleId },
      select: { courseId: true },
    });
    if (module) revalidateCoursePaths(module.courseId, purchase.moduleId);
    return { status: 'PAID' };
  }

  return { status: payment.status };
}

// ---------- COMPRA DA FORMAÇÃO COMPLETA (BUNDLE) — M12c ----------
// Um único pagamento no Asaas cobre todos os módulos do curso. Cada módulo
// gera um StudentPurchase PENDING com o MESMO externalId; o webhook (e o
// polling abaixo) marcam todos como PAID de uma vez, pois atualizam por
// externalId.

async function prepareBundleCheckout(
  userId: string,
  courseId: string,
): Promise<
  | { error: string }
  | {
      info: BundleInfo;
      course: { id: string; title: string };
    }
> {
  const info = await getBundleInfo(userId, courseId);
  if (!info) return { error: 'Formação completa indisponível para este curso' };

  // Regra anti-cobrança-duplicada: qualquer módulo PAID torna o bundle
  // indisponível (sem crédito proporcional).
  if (!info.available) {
    const n = info.alreadyOwnedModuleIds.length;
    return {
      error: `Você já tem ${n} módulo${n === 1 ? '' : 's'} deste curso. Continue comprando individualmente.`,
    };
  }
  if (info.payableModuleIds.length === 0) {
    return { error: 'Não há módulos disponíveis neste curso' };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true },
  });
  if (!course) return { error: 'Curso não encontrado' };

  return { info, course };
}

async function upsertBundlePurchases(
  userId: string,
  moduleIds: string[],
  paymentId: string,
  invoiceUrl: string,
  paymentMethod: string,
  status: 'PENDING' | 'PAID',
): Promise<string> {
  let firstPurchaseId = '';
  for (const moduleId of moduleIds) {
    const purchase = await prisma.studentPurchase.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      update: {
        statusPayment: status,
        purchasedAt: status === 'PAID' ? new Date() : null,
        externalId: paymentId,
        invoiceUrl,
        paymentMethod,
      },
      create: {
        userId,
        moduleId,
        statusPayment: status,
        purchasedAt: status === 'PAID' ? new Date() : null,
        externalId: paymentId,
        invoiceUrl,
        paymentMethod,
      },
    });
    if (!firstPurchaseId) firstPurchaseId = purchase.id;
  }
  return firstPurchaseId;
}

function revalidateBundlePaths(courseId: string) {
  revalidatePath('/dashboard');
  revalidatePath('/courses');
  revalidatePath(`/courses/${courseId}`);
}

export async function createBundlePixPaymentAction(courseId: string): Promise<PixResult> {
  const user = await requireAuth();
  const prep = await prepareBundleCheckout(user.id, courseId);
  if ('error' in prep) return { ok: false, error: prep.error };

  const { info, course } = prep;
  const provider = getPaymentProvider();
  const customerId = await ensureAsaasCustomer(user);

  const payment = await provider.createPayment({
    customerId,
    billingType: 'PIX',
    value: info.bundleApplicableCents / 100,
    dueDate: tomorrow(),
    description: `Formação completa: ${course.title}`,
    externalReference: course.id,
  });

  const qr = await provider.getPixQrCode(payment.id);
  const purchaseId = await upsertBundlePurchases(
    user.id,
    info.payableModuleIds,
    payment.id,
    payment.invoiceUrl,
    'PIX',
    'PENDING',
  );

  revalidateBundlePaths(course.id);

  return {
    ok: true,
    purchaseId,
    qrCodeBase64: qr.encodedImage,
    copyPaste: qr.payload,
    expirationDate: qr.expirationDate,
  };
}

export async function createBundleBoletoPaymentAction(courseId: string): Promise<BoletoResult> {
  const user = await requireAuth();
  const prep = await prepareBundleCheckout(user.id, courseId);
  if ('error' in prep) return { ok: false, error: prep.error };

  const { info, course } = prep;
  const provider = getPaymentProvider();
  const customerId = await ensureAsaasCustomer(user);

  const payment = await provider.createPayment({
    customerId,
    billingType: 'BOLETO',
    value: info.bundleApplicableCents / 100,
    dueDate: tomorrow(),
    description: `Formação completa: ${course.title}`,
    externalReference: course.id,
  });

  const purchaseId = await upsertBundlePurchases(
    user.id,
    info.payableModuleIds,
    payment.id,
    payment.invoiceUrl,
    'BOLETO',
    'PENDING',
  );

  revalidateBundlePaths(course.id);

  return { ok: true, purchaseId, invoiceUrl: payment.invoiceUrl };
}

export async function createBundleCreditCardPaymentAction(
  courseId: string,
  formData: FormData,
): Promise<CardResult> {
  const user = await requireAuth();
  const prep = await prepareBundleCheckout(user.id, courseId);
  if ('error' in prep) return { ok: false, error: prep.error };

  const holderName = String(formData.get('holderName') ?? '').trim();
  const number = String(formData.get('number') ?? '').replace(/\D/g, '');
  const expiry = String(formData.get('expiry') ?? '').trim();
  const ccv = String(formData.get('ccv') ?? '').trim();
  const cpfCnpj = String(formData.get('cpfCnpj') ?? '').replace(/\D/g, '');
  const phone = String(formData.get('phone') ?? '').replace(/\D/g, '');
  const postalCode = String(formData.get('postalCode') ?? '').replace(/\D/g, '');
  const addressNumber = String(formData.get('addressNumber') ?? '').trim();

  const m = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (
    !holderName ||
    number.length < 13 ||
    !m ||
    ccv.length < 3 ||
    cpfCnpj.length < 11 ||
    phone.length < 10 ||
    postalCode.length !== 8 ||
    !addressNumber
  ) {
    return { ok: false, error: 'Dados do cartão incompletos ou inválidos' };
  }

  const { info, course } = prep;
  const provider = getPaymentProvider();
  const customerId = await ensureAsaasCustomer(user);

  // Os dados do cartão são usados apenas nesta chamada e jamais persistidos.
  const payment = await provider.createPayment({
    customerId,
    billingType: 'CREDIT_CARD',
    value: info.bundleApplicableCents / 100,
    dueDate: tomorrow(),
    description: `Formação completa: ${course.title}`,
    externalReference: course.id,
    creditCard: {
      holderName,
      number,
      expiryMonth: m[1],
      expiryYear: `20${m[2]}`,
      ccv,
    },
    creditCardHolderInfo: {
      name: holderName,
      email: user.email ?? '',
      cpfCnpj,
      phone,
      postalCode,
      addressNumber,
    },
  });

  const approved = payment.status === 'CONFIRMED' || payment.status === 'RECEIVED';

  await upsertBundlePurchases(
    user.id,
    info.payableModuleIds,
    payment.id,
    payment.invoiceUrl,
    'CREDIT_CARD',
    approved ? 'PAID' : 'PENDING',
  );

  revalidateBundlePaths(course.id);

  if (!approved) {
    return { ok: false, error: `Pagamento não aprovado (status: ${payment.status})` };
  }

  return { ok: true, purchaseId: payment.id };
}
