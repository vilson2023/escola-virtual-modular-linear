import { prisma } from '@/lib/prisma';

export type BundleInfo = {
  available: boolean; // true se bundlePriceCents está definido E o aluno não tem nenhum módulo PAID
  bundlePriceCents: number;
  modulesTotalCents: number; // soma dos preços individuais
  discountCents: number; // modulesTotal - bundle
  discountPercent: number; // 0-100
  // módulos que o aluno JÁ TEM PAID (não devem ser cobrados de novo)
  alreadyOwnedModuleIds: string[];
  payableModuleIds: string[]; // módulos que faltam comprar
  payableTotalCents: number; // soma dos módulos que faltam
  bundleApplicableCents: number; // preço cobrado: bundle se nenhum módulo owned; 0 se já tem algum (bundle indisponível)
};

/**
 * Informações da "formação completa" de um curso para um aluno.
 *
 * Regra de negócio (M12c):
 * - Se o curso não tem bundlePriceCents → retorna null (pacote não existe).
 * - Se o aluno não tem NENHUM módulo PAID do curso → bundle disponível por
 *   bundlePriceCents.
 * - Se o aluno tem QUALQUER módulo PAID → bundle INDISPONÍVEL (available=false).
 *   Sem crédito proporcional: evita cobrança duplicada e confusão de crédito.
 *   A UI orienta o aluno a continuar comprando individualmente.
 *
 * userId pode ser null (anônimo) — nesse caso nenhum módulo é considerado owned.
 */
export async function getBundleInfo(
  userId: string | null,
  courseId: string,
): Promise<BundleInfo | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { bundlePriceCents: true },
  });
  if (!course || course.bundlePriceCents == null) return null;

  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, priceCents: true },
  });

  let alreadyOwnedModuleIds: string[] = [];
  if (userId && modules.length > 0) {
    const purchases = await prisma.studentPurchase.findMany({
      where: {
        userId,
        moduleId: { in: modules.map((m) => m.id) },
        statusPayment: 'PAID',
      },
      select: { moduleId: true },
    });
    alreadyOwnedModuleIds = purchases.map((p) => p.moduleId);
  }

  const ownedSet = new Set(alreadyOwnedModuleIds);
  const payableModuleIds = modules.filter((m) => !ownedSet.has(m.id)).map((m) => m.id);

  const modulesTotalCents = modules.reduce((acc, m) => acc + m.priceCents, 0);
  const payableTotalCents = payableModuleIds.reduce(
    (acc, id) => acc + (modules.find((m) => m.id === id)?.priceCents ?? 0),
    0,
  );

  const bundlePriceCents = course.bundlePriceCents;
  const discountCents = Math.max(0, modulesTotalCents - bundlePriceCents);
  const discountPercent =
    modulesTotalCents === 0 ? 0 : Math.round((discountCents / modulesTotalCents) * 100);

  const hasOwned = alreadyOwnedModuleIds.length > 0;

  return {
    available: !hasOwned,
    bundlePriceCents,
    modulesTotalCents,
    discountCents,
    discountPercent,
    alreadyOwnedModuleIds,
    payableModuleIds,
    payableTotalCents,
    bundleApplicableCents: hasOwned ? 0 : bundlePriceCents,
  };
}
