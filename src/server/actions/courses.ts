'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/server/auth/session';
import { courseSchema } from '@/server/validators/course';

export type ActionState = { error?: string; success?: boolean } | null;

export async function createCourseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('ADMIN');

  const parsed = courseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') ?? '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.course.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
    },
  });

  revalidatePath('/admin/courses');
  redirect('/admin/courses');
}

export async function updateCourseAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('ADMIN');

  const parsed = courseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') ?? '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.course.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
    },
  });

  revalidatePath('/admin/courses');
  redirect('/admin/courses');
}

export async function deleteCourseAction(id: string) {
  await requireRole('ADMIN');

  await prisma.course.delete({ where: { id } });

  revalidatePath('/admin/courses');
}
