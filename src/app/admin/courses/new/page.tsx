import { createCourseAction } from '@/server/actions/courses';
import { CourseForm } from '@/components/admin/CourseForm';

export default function NewCoursePage() {
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
        <span className="font-medium text-slate-900">Novo Curso</span>
      </nav>

      <h2 className="mt-4 text-2xl font-bold text-slate-900">Novo Curso</h2>

      <div className="mt-6">
        <CourseForm action={createCourseAction} submitLabel="Criar Curso" />
      </div>
    </div>
  );
}
