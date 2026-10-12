import { prisma } from '@/lib/prisma';
import { deleteCourseAction } from '@/server/actions/courses';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { modules: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Cursos</h2>
        <Button href="/admin/courses/new" variant="primary" size="sm">
          Novo Curso
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="mt-8 text-center">
          <p className="text-slate-500">Nenhum curso cadastrado ainda.</p>
          <div className="mt-4">
            <Button href="/admin/courses/new" variant="primary" size="sm">
              Criar primeiro curso
            </Button>
          </div>
        </Card>
      ) : (
        <div className="shadow-card mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
                  Módulos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{course.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{course._count.modules}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {course.createdAt.toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Button href={`/admin/courses/${course.id}`} variant="primary" size="sm">
                      Abrir
                    </Button>
                    <Button
                      href={`/admin/courses/${course.id}/edit`}
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                    >
                      Editar
                    </Button>
                    <span className="ml-2">
                      <DeleteButton
                        onDelete={deleteCourseAction.bind(null, course.id)}
                        confirmMessage={`Excluir o curso "${course.title}"? Todos os módulos e aulas também serão apagados.`}
                      />
                    </span>
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
