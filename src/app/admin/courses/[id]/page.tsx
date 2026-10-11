import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/server/auth/session';
import { deleteModuleAction } from '@/server/actions/modules';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DeleteButton } from '@/components/admin/DeleteButton';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function CourseHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole('ADMIN');
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: { _count: { select: { lessons: true } } },
      },
    },
  });

  if (!course) notFound();

  return (
    <div>
      <nav className="text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-700">
          Admin
        </Link>
        {' / '}
        <Link href="/admin/courses" className="hover:text-slate-700">
          Cursos
        </Link>
        {' / '}
        <span className="font-medium text-slate-900">{course.title}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{course.title}</h2>
          {course.description && (
            <p className="mt-1 text-sm text-slate-500">{course.description}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button href={`/admin/courses/${id}/edit`} variant="secondary" size="sm">
            Editar Curso
          </Button>
          <Button href={`/admin/courses/${id}/modules/new`} variant="primary" size="sm">
            + Novo Módulo
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {course.modules.length === 0 ? (
          <Card className="text-center">
            <p className="text-slate-500">Nenhum módulo ainda. Crie o primeiro para começar.</p>
            <div className="mt-4">
              <Button href={`/admin/courses/${id}/modules/new`} variant="primary" size="sm">
                Criar primeiro módulo
              </Button>
            </div>
          </Card>
        ) : (
          course.modules.map((module) => (
            <Card key={module.id} className="flex items-center gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {module.orderIndex}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
                  {module.presentationVideoUrl && (
                    <Badge variant="neutral">Tem vídeo de apresentação</Badge>
                  )}
                </div>
                {module.description && (
                  <p className="mt-1 truncate text-sm text-slate-500">{module.description}</p>
                )}
                <p className="mt-1 text-sm text-slate-500">
                  {module._count.lessons} aulas · {brl.format(module.priceCents / 100)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  href={`/admin/courses/${id}/modules/${module.id}/edit`}
                  variant="ghost"
                  size="sm"
                >
                  Editar
                </Button>
                <DeleteButton
                  onDelete={deleteModuleAction.bind(null, module.id)}
                  confirmMessage={`Excluir o módulo "${module.title}"? As aulas dele também serão apagadas.`}
                />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
