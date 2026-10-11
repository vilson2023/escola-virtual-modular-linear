'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/session';
import { canPurchaseModule } from '@/server/services/module-state';

export async function simulatePurchaseAction(moduleId: string) {
  // Guard: só funciona em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Esta ação é apenas para desenvolvimento');
  }

  const user = await requireAuth();

  const check = await canPurchaseModule(user.id, moduleId);
  if (!check.ok) {
    throw new Error(check.reason);
  }

  // Descobre o courseId para revalidar
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });

  await prisma.studentPurchase.upsert({
    where: { userId_moduleId: { userId: user.id, moduleId } },
    update: { statusPayment: 'PAID', purchasedAt: new Date() },
    create: {
      userId: user.id,
      moduleId,
      statusPayment: 'PAID',
      purchasedAt: new Date(),
    },
  });

  if (module) {
    revalidatePath('/dashboard');
    revalidatePath('/courses');
    revalidatePath(`/courses/${module.courseId}`);
  }
}
