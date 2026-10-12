'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/server/auth/session';
import { lessonSchema } from '@/server/validators/lesson';

export type LessonActionState = { error?: string; success?: boolean } | null;

type LessonContentType = 'VIDEO' | 'TEXT' | 'FILE';

function parseLesson(formData: FormData) {
  return lessonSchema.safeParse({
    title: formData.get('title'),
    contentType: formData.get('contentType'),
    orderIndex: formData.get('orderIndex'),
    videoUrl: formData.get('videoUrl') ?? '',
    textContent: formData.get('textContent') ?? '',
    fileUrl: formData.get('fileUrl') ?? '',
  });
}

// Mantém apenas os campos usados pelo tipo de conteúdo; zera os demais.
function contentData(
  contentType: LessonContentType,
  data: {
    videoUrl?: string;
    textContent?: string;
    fileUrl?: string;
  },
) {
  return {
    videoUrl: contentType === 'VIDEO' ? data.videoUrl || null : null,
    textContent: contentType === 'TEXT' ? data.textContent || null : null,
    fileUrl: contentType === 'FILE' ? data.fileUrl || null : null,
  };
}

export async function createLessonAction(
  moduleId: string,
  _prev: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  await requireRole('ADMIN');

  const parsed = parseLesson(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const duplicate = await prisma.lesson.findFirst({
    where: { moduleId, orderIndex: parsed.data.orderIndex },
  });

  if (duplicate) {
    return { error: 'Já existe uma aula com essa ordem neste módulo' };
  }

  await prisma.lesson.create({
    data: {
      moduleId,
      title: parsed.data.title,
      contentType: parsed.data.contentType,
      orderIndex: parsed.data.orderIndex,
      ...contentData(parsed.data.contentType, parsed.data),
    },
  });

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });
  if (!module) {
    return { error: 'Módulo não encontrado' };
  }

  revalidatePath(`/admin/courses/${module.courseId}/modules/${moduleId}`);
  redirect(`/admin/courses/${module.courseId}/modules/${moduleId}`);
}

export async function updateLessonAction(
  id: string,
  _prev: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  await requireRole('ADMIN');

  const parsed = parseLesson(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const current = await prisma.lesson.findUnique({ where: { id } });
  if (!current) {
    return { error: 'Aula não encontrada' };
  }

  if (parsed.data.orderIndex !== current.orderIndex) {
    const collision = await prisma.lesson.findFirst({
      where: {
        moduleId: current.moduleId,
        orderIndex: parsed.data.orderIndex,
        id: { not: id },
      },
    });

    if (collision) {
      return { error: 'Já existe uma aula com essa ordem neste módulo' };
    }
  }

  await prisma.lesson.update({
    where: { id },
    data: {
      title: parsed.data.title,
      contentType: parsed.data.contentType,
      orderIndex: parsed.data.orderIndex,
      ...contentData(parsed.data.contentType, parsed.data),
    },
  });

  const module = await prisma.module.findUnique({
    where: { id: current.moduleId },
    select: { courseId: true },
  });
  if (!module) {
    return { error: 'Módulo não encontrado' };
  }

  revalidatePath(`/admin/courses/${module.courseId}/modules/${current.moduleId}`);
  redirect(`/admin/courses/${module.courseId}/modules/${current.moduleId}`);
}

export async function deleteLessonAction(id: string) {
  await requireRole('ADMIN');

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    select: { moduleId: true, module: { select: { courseId: true } } },
  });
  if (!lesson) return;

  await prisma.lesson.delete({ where: { id } });

  revalidatePath(`/admin/courses/${lesson.module.courseId}/modules/${lesson.moduleId}`);
}
