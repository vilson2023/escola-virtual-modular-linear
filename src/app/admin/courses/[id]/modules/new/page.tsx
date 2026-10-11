import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/server/auth/session';
import { createModuleAction } from '@/server/actions/modules';
import { ModuleForm } from '@/components/admin/ModuleForm';

export default async function NewModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole('ADMIN');
  const { id } = await params;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();

  const max = await prisma.module.findFirst({
    where: { courseId: id },
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  });
  const nextOrder = (max?.orderIndex ?? 0) + 1;

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
        <span className="font-medium text-slate-900">Novo Módulo</span>
      </nav>

      <h2 className="mt-4 text-2xl font-bold text-slate-900">Novo Módulo</h2>
      <p className="mt-1 text-sm text-slate-500">no curso {course.title}</p>

      <div className="mt-6">
        <ModuleForm
          action={createModuleAction.bind(null, id)}
          initialData={{ orderIndex: nextOrder, priceCents: 0 }}
          submitLabel="Criar Módulo"
          cancelHref={`/admin/courses/${id}`}
        />
      </div>
    </div>
  );
}
