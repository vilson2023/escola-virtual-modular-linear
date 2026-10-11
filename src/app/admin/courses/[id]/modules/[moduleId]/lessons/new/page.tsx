import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/server/auth/session';
import { createLessonAction } from '@/server/actions/lessons';
import { LessonForm } from '@/components/admin/LessonForm';

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  await requireRole('ADMIN');
  const { id, moduleId } = await params;

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { select: { id: true, title: true } } },
  });
  if (!module || module.courseId !== id) notFound();

  const max = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  });
  const nextOrder = (max?.orderIndex ?? 0) + 1;

  const hubPath = `/admin/courses/${id}/modules/${moduleId}`;

  return (
    <div>
      <nav className="text-sm text-slate-500">
        <a href="/admin" className="hover:text-slate-700">
          Admin
        </a>
        {' / '}
        <a href="/admin/courses" className="hover:text-slate-700">
          Cursos
        </a>
        {' / '}
        <a href={`/admin/courses/${id}`} className="hover:text-slate-700">
          {module.course.title}
        </a>
        {' / '}
        <a href={hubPath} className="hover:text-slate-700">
          {module.title}
        </a>
        {' / '}
        <span className="font-medium text-slate-900">Nova Aula</span>
      </nav>

      <h2 className="mt-4 text-2xl font-bold text-slate-900">Nova Aula</h2>
      <p className="mt-1 text-sm text-slate-500">no módulo {module.title}</p>

      <div className="mt-6">
        <LessonForm
          action={createLessonAction.bind(null, moduleId)}
          initialData={{ orderIndex: nextOrder, contentType: 'VIDEO' }}
          submitLabel="Criar Aula"
          cancelHref={hubPath}
        />
      </div>
    </div>
  );
}
