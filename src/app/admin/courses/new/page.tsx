import { createCourseAction } from '@/server/actions/courses';
import { CourseForm } from '@/components/admin/CourseForm';

export default function NewCoursePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Novo Curso</h2>
      <div className="mt-6">
        <CourseForm action={createCourseAction} submitLabel="Criar Curso" />
      </div>
    </div>
  );
}
