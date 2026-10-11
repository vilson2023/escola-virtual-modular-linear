'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/session';

export async function markLessonCompleteAction(lessonId: string) {
  const user = await requireAuth();

  // Busca a aula e o módulo (para guard + revalidação)
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      moduleId: true,
      module: { select: { courseId: true } },
    },
  });

  if (!lesson) throw new Error('Aula não encontrada');

  // Guard: o aluno precisa ter compra PAID do módulo
  const purchase = await prisma.studentPurchase.findFirst({
    where: {
      userId: user.id,
      moduleId: lesson.moduleId,
      statusPayment: 'PAID',
    },
    select: { id: true },
  });

  if (!purchase) {
    throw new Error('Você não tem acesso a este módulo');
  }

  // Upsert: cria ou atualiza o progresso
  await prisma.studentProgress.upsert({
    where: {
      userId_lessonId: { userId: user.id, lessonId },
    },
    update: { completed: true, completedAt: new Date() },
    create: {
      userId: user.id,
      lessonId,
      completed: true,
      completedAt: new Date(),
    },
  });

  // Revalida as views afetadas
  const { moduleId } = lesson;
  const { courseId } = lesson.module;
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/modules/${moduleId}`);
  revalidatePath(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
  revalidatePath('/dashboard');
}

export async function unmarkLessonCompleteAction(lessonId: string) {
  const user = await requireAuth();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      moduleId: true,
      module: { select: { courseId: true } },
    },
  });

  if (!lesson) throw new Error('Aula não encontrada');

  await prisma.studentProgress.updateMany({
    where: { userId: user.id, lessonId },
    data: { completed: false, completedAt: null },
  });

  const { moduleId } = lesson;
  const { courseId } = lesson.module;
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/modules/${moduleId}`);
  revalidatePath(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
  revalidatePath('/dashboard');
}
