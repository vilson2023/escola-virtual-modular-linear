import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { updateCourseAction } from '@/server/actions/courses';
import { CourseForm } from '@/components/admin/CourseForm';

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Editar Curso</h2>
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
