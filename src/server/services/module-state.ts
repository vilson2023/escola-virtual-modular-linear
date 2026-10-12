import { prisma } from '@/lib/prisma';

export type ModuleState = 'LIBERADO' | 'VITRINE' | 'BLOQUEADO';

export type ModuleWithState = {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  priceCents: number;
  presentationVideoUrl: string | null;
  estimatedDurationMinutes: number | null; // NOVO (M12b)
  lessonCount: number;
  completedCount: number; // NOVO (M12b)
  isPurchased: boolean; // NOVO (M12b)
  state: ModuleState;
  progressPercent: number;
};

/**
 * Calcula o estado de todos os módulos de um curso para um aluno.
 *
 * Regra:
 * - LIBERADO: o aluno possui compra PAID para este módulo
 * - VITRINE: não possui compra, mas TODOS os módulos anteriores estão
 *   100% concluídos E comprados (ou seja, este é o próximo da fila)
 * - BLOQUEADO: qualquer outro caso
 */
export async function getCourseModulesForStudent(
  userId: string,
  courseId: string,
): Promise<ModuleWithState[]> {
  // 1. Busca os módulos ordenados por orderIndex
  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { orderIndex: 'asc' },
    include: { _count: { select: { lessons: true } } },
  });

  if (modules.length === 0) return [];

  // 2. Busca todas as compras PAID do aluno para esses módulos
  const moduleIds = modules.map((m) => m.id);
  const purchases = await prisma.studentPurchase.findMany({
    where: {
      userId,
      moduleId: { in: moduleIds },
      statusPayment: 'PAID',
    },
    select: { moduleId: true },
  });
  const purchasedSet = new Set(purchases.map((p) => p.moduleId));

  // 3. Busca todas as lições dos módulos + progresso do aluno
  const lessons = await prisma.lesson.findMany({
    where: { moduleId: { in: moduleIds } },
    select: { id: true, moduleId: true },
  });

  const progress = await prisma.studentProgress.findMany({
    where: {
      userId,
      lessonId: { in: lessons.map((l) => l.id) },
      completed: true,
    },
    select: { lessonId: true },
  });
  const completedSet = new Set(progress.map((p) => p.lessonId));

  // 4. Calcula progresso por módulo
  const lessonsByModule = new Map<string, number>();
  for (const l of lessons) {
    lessonsByModule.set(l.moduleId, (lessonsByModule.get(l.moduleId) ?? 0) + 1);
  }

  const completedByModule = new Map<string, number>();
  for (const l of lessons) {
    if (completedSet.has(l.id)) {
      completedByModule.set(l.moduleId, (completedByModule.get(l.moduleId) ?? 0) + 1);
    }
  }

  // 5. Itera calculando o estado de cada módulo
  const result: ModuleWithState[] = [];
  let previousCompleted = true; // o "módulo anterior" do primeiro não existe, então consideramos verdadeiro

  for (const m of modules) {
    const isPurchased = purchasedSet.has(m.id);
    const lessonCount = lessonsByModule.get(m.id) ?? 0;
    const completedCount = completedByModule.get(m.id) ?? 0;
    const progressPercent =
      lessonCount === 0 ? 0 : Math.round((completedCount / lessonCount) * 100);

    let state: ModuleState;
    if (isPurchased) {
      state = 'LIBERADO';
    } else if (previousCompleted) {
      state = 'VITRINE';
    } else {
      state = 'BLOQUEADO';
    }

    result.push({
      id: m.id,
      title: m.title,
      description: m.description,
      orderIndex: m.orderIndex,
      priceCents: m.priceCents,
      presentationVideoUrl: m.presentationVideoUrl,
      estimatedDurationMinutes: m.estimatedDurationMinutes,
      lessonCount,
      completedCount,
      isPurchased,
      state,
      progressPercent,
    });

    // Para o próximo módulo, "previousCompleted" é verdadeiro se
    // este módulo foi comprado E está com 100% de conclusão.
    previousCompleted = isPurchased && progressPercent === 100;
  }

  return result;
}

/**
 * Guard: pode o aluno acessar as aulas deste módulo?
 */
export async function canAccessModule(userId: string, moduleId: string): Promise<boolean> {
  const purchase = await prisma.studentPurchase.findFirst({
    where: { userId, moduleId, statusPayment: 'PAID' },
    select: { id: true },
  });
  return !!purchase;
}

/**
 * Guard: o aluno pode comprar este módulo? (apenas se for o próximo da fila)
 */
export async function canPurchaseModule(
  userId: string,
  moduleId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const target = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, courseId: true, orderIndex: true },
  });

  if (!target) return { ok: false, reason: 'Módulo não encontrado' };

  // Já desbloqueado (compra PAID) não pode ser comprado de novo:
  // evita sobrescrever a compra existente e cobrança duplicada.
  const existingPurchase = await prisma.studentPurchase.findFirst({
    where: { userId, moduleId, statusPayment: 'PAID' },
    select: { id: true },
  });
  if (existingPurchase) return { ok: false, reason: 'Módulo já desbloqueado' };

  const previousModules = await prisma.module.findMany({
    where: {
      courseId: target.courseId,
      orderIndex: { lt: target.orderIndex },
    },
    orderBy: { orderIndex: 'asc' },
    include: { _count: { select: { lessons: true } } },
  });

  for (const prev of previousModules) {
    const purchase = await prisma.studentPurchase.findFirst({
      where: { userId, moduleId: prev.id, statusPayment: 'PAID' },
      select: { id: true },
    });

    if (!purchase) {
      return { ok: false, reason: 'Você precisa concluir o módulo anterior primeiro' };
    }

    const totalLessons = prev._count.lessons;
    if (totalLessons === 0) continue;

    const completed = await prisma.studentProgress.count({
      where: {
        userId,
        completed: true,
        lesson: { moduleId: prev.id },
      },
    });

    const percent = Math.round((completed / totalLessons) * 100);
    if (percent < 100) {
      return { ok: false, reason: 'Você precisa concluir o módulo anterior primeiro' };
    }
  }

  return { ok: true };
}
