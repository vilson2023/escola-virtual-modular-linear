import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { updateCourseAction } from '@/server/actions/courses';
import { CourseForm } from '@/components/admin/CourseForm';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();

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
          {course.title}
        </a>
        {' / '}
        <span className="font-medium text-slate-900">Editar Curso</span>
      </nav>

      <h2 className="mt-4 text-2xl font-bold text-slate-900">Editar Curso</h2>

      <div className="mt-6">
        <CourseForm
          action={updateCourseAction.bind(null, id)}
          initialData={{ title: course.title, description: course.description }}
          submitLabel="Salvar Alterações"
        />
      </div>
    </div>
  );
}
