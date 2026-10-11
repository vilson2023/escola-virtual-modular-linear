import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/server/auth/session';
import { updateLessonAction } from '@/server/actions/lessons';
import { LessonForm } from '@/components/admin/LessonForm';

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string; lessonId: string }>;
}) {
  await requireRole('ADMIN');
  const { id, moduleId, lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: { include: { course: { select: { id: true, title: true } } } },
    },
  });
  if (!lesson || lesson.moduleId !== moduleId || lesson.module.courseId !== id) {
    notFound();
  }

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
          {lesson.module.course.title}
        </a>
        {' / '}
        <a href={hubPath} className="hover:text-slate-700">
          {lesson.module.title}
        </a>
        {' / '}
        <span className="font-medium text-slate-900">Editar Aula</span>
      </nav>

      <h2 className="mt-4 text-2xl font-bold text-slate-900">Editar Aula</h2>
      <p className="mt-1 text-sm text-slate-500">{lesson.title}</p>

      <div className="mt-6">
        <LessonForm
          action={updateLessonAction.bind(null, lessonId)}
          initialData={{
            title: lesson.title,
            contentType: lesson.contentType,
            orderIndex: lesson.orderIndex,
            videoUrl: lesson.videoUrl,
            textContent: lesson.textContent,
            fileUrl: lesson.fileUrl,
          }}
          submitLabel="Salvar Alterações"
          cancelHref={hubPath}
        />
      </div>
    </div>
  );
}
