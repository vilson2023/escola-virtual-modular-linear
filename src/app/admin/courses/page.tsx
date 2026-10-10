import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { deleteCourseAction } from '@/server/actions/courses';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { modules: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Cursos</h2>
        <Link
          href="/admin/courses/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Novo Curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          Nenhum curso cadastrado ainda.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-md border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Módulos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {course.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {course._count.modules}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {course.createdAt.toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                      className="mr-4 text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </Link>
                    <DeleteButton
                      onDelete={deleteCourseAction.bind(null, course.id)}
                      confirmMessage={`Excluir o curso "${course.title}"? Esta ação não pode ser desfeita.`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
