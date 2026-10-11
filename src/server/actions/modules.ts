'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/server/auth/session';
import { moduleSchema } from '@/server/validators/module';

export type ModuleActionState = { error?: string; success?: boolean } | null;

export async function createModuleAction(
  courseId: string,
  _prev: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  await requireRole('ADMIN');

  const parsed = moduleSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') ?? '',
    orderIndex: formData.get('orderIndex'),
    priceCents: formData.get('priceCents'),
    presentationVideoUrl: formData.get('presentationVideoUrl') ?? '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const duplicate = await prisma.module.findFirst({
    where: { courseId, orderIndex: parsed.data.orderIndex },
  });

  if (duplicate) {
    return { error: 'Já existe um módulo com essa ordem neste curso' };
  }

  await prisma.module.create({
    data: {
      courseId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      orderIndex: parsed.data.orderIndex,
      priceCents: parsed.data.priceCents,
      presentationVideoUrl: parsed.data.presentationVideoUrl || null,
    },
  });

  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

export async function updateModuleAction(
  id: string,
  _prev: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  await requireRole('ADMIN');

  const parsed = moduleSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') ?? '',
    orderIndex: formData.get('orderIndex'),
    priceCents: formData.get('priceCents'),
    presentationVideoUrl: formData.get('presentationVideoUrl') ?? '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const current = await prisma.module.findUnique({ where: { id } });
  if (!current) {
    return { error: 'Módulo não encontrado' };
  }

  if (parsed.data.orderIndex !== current.orderIndex) {
    const collision = await prisma.module.findFirst({
      where: {
        courseId: current.courseId,
        orderIndex: parsed.data.orderIndex,
        id: { not: id },
      },
    });

    if (collision) {
      return { error: 'Já existe um módulo com essa ordem neste curso' };
    }
  }

  await prisma.module.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      orderIndex: parsed.data.orderIndex,
      priceCents: parsed.data.priceCents,
      presentationVideoUrl: parsed.data.presentationVideoUrl || null,
    },
  });

  revalidatePath(`/admin/courses/${current.courseId}`);
  redirect(`/admin/courses/${current.courseId}`);
}

export async function deleteModuleAction(id: string) {
  await requireRole('ADMIN');

  const module = await prisma.module.findUnique({ where: { id } });
  if (!module) return;

  await prisma.module.delete({ where: { id } });

  revalidatePath(`/admin/courses/${module.courseId}`);
}
