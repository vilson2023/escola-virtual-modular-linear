'use server';

import { requireAuth } from '@/server/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * Ferramentas de desenvolvimento — NUNCA disponíveis em produção.
 * Todas operam apenas no usuário logado (aluno demo do engenheiro).
 */

type Result = { ok: true; message: string } | { error: string };

function guard(): Result | null {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Ferramentas de desenvolvimento indisponíveis em produção' };
  }
  return null;
}

export async function resetMyProgressAction(): Promise<Result> {
  const blocked = guard();
  if (blocked) return blocked;
  const user = await requireAuth();

  const deleted = await prisma.studentProgress.deleteMany({ where: { userId: user.id } });
  return { ok: true, message: `Progresso apagado (${deleted.count} aulas)` };
}

export async function deleteMyCertificateAction(): Promise<Result> {
  const blocked = guard();
  if (blocked) return blocked;
  const user = await requireAuth();

  const deleted = await prisma.certificate.deleteMany({ where: { userId: user.id } });
  return { ok: true, message: `Certificados apagados (${deleted.count})` };
}

export async function resetEverythingForMeAction(): Promise<Result> {
  const blocked = guard();
  if (blocked) return blocked;
  const user = await requireAuth();

  const progress = await prisma.studentProgress.deleteMany({ where: { userId: user.id } });
  const pendingPurchases = await prisma.studentPurchase.deleteMany({
    where: { userId: user.id, statusPayment: 'PENDING' },
  });
  const certificates = await prisma.certificate.deleteMany({ where: { userId: user.id } });
  return {
    ok: true,
    message: `Reset completo: ${progress.count} aulas, ${pendingPurchases.count} compras PENDING, ${certificates.count} certificados`,
  };
}

export async function reseedMyUserAction(): Promise<Result> {
  const blocked = guard();
  if (blocked) return blocked;
  const user = await requireAuth();

  const course = await prisma.course.findFirst({
    where: { title: 'Curso Demo: Fundamentos' },
  });
  if (!course) return { error: 'Curso demo não encontrado — rode npm run db:seed primeiro' };

  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { orderIndex: 'asc' },
  });
  const [m1, m2] = modules;
  if (!m1 || !m2) return { error: 'Módulos 1 e 2 não encontrados no curso demo' };

  // zera o usuário
  await prisma.studentProgress.deleteMany({ where: { userId: user.id } });
  await prisma.studentPurchase.deleteMany({ where: { userId: user.id } });
  await prisma.certificate.deleteMany({ where: { userId: user.id } });

  // M1 + M2 PAID, M3 sem compra
  for (const [mod, ext] of [
    [m1, 'pay_dev_m1'],
    [m2, 'pay_dev_m2'],
  ] as const) {
    await prisma.studentPurchase.create({
      data: {
        userId: user.id,
        moduleId: mod.id,
        statusPayment: 'PAID',
        externalId: ext,
        paymentMethod: 'PIX',
        purchasedAt: new Date(),
      },
    });
  }

  return { ok: true, message: 'Usuário repopulado: M1+M2 PAID, M3 disponível para compra' };
}
