import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/server/auth/session';
import { updateModuleAction } from '@/server/actions/modules';
import { ModuleForm } from '@/components/admin/ModuleForm';

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  await requireRole('ADMIN');
  const { id, moduleId } = await params;

  const module = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!module || module.courseId !== id) notFound();

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
          {module.title}
        </a>
        {' / '}
        <span className="font-medium text-slate-900">Editar Módulo</span>
      </nav>

      <h2 className="mt-4 text-2xl font-bold text-slate-900">Editar Módulo</h2>

      <div className="mt-6">
        <ModuleForm
          action={updateModuleAction.bind(null, moduleId)}
          initialData={{
            title: module.title,
            description: module.description,
            orderIndex: module.orderIndex,
            priceCents: module.priceCents,
            presentationVideoUrl: module.presentationVideoUrl,
          }}
          submitLabel="Salvar Alterações"
          cancelHref={`/admin/courses/${id}`}
        />
      </div>
    </div>
  );
}
