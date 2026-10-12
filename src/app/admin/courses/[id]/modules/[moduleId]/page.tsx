import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/server/auth/session';
import { deleteLessonAction } from '@/server/actions/lessons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DeleteButton } from '@/components/admin/DeleteButton';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const contentTypeBadge: Record<
  string,
  { label: string; variant: 'brand' | 'neutral' | 'warning' }
> = {
  VIDEO: { label: 'Vídeo', variant: 'brand' },
  TEXT: { label: 'Texto', variant: 'neutral' },
  FILE: { label: 'Arquivo', variant: 'warning' },
};

function lessonPreview(lesson: {
  contentType: string;
  videoUrl: string | null;
  textContent: string | null;
  fileUrl: string | null;
}): string | null {
  if (lesson.contentType === 'TEXT' && lesson.textContent) {
    return lesson.textContent.length > 100
      ? lesson.textContent.slice(0, 100) + '…'
      : lesson.textContent;
  }
  if (lesson.contentType === 'VIDEO' && lesson.videoUrl) {
    return lesson.videoUrl.length > 80 ? lesson.videoUrl.slice(0, 80) + '…' : lesson.videoUrl;
  }
  if (lesson.contentType === 'FILE' && lesson.fileUrl) {
    return lesson.fileUrl.length > 80 ? lesson.fileUrl.slice(0, 80) + '…' : lesson.fileUrl;
  }
  return null;
}

export default async function ModuleHubPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  await requireRole('ADMIN');
  const { id, moduleId } = await params;

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: true,
      lessons: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!module || module.courseId !== id) notFound();

  const hubPath = `/admin/courses/${id}/modules/${moduleId}`;

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
        <Link href={`/admin/courses/${id}`} className="hover:text-slate-700">
          {module.course.title}
        </Link>
        {' / '}
        <span className="font-medium text-slate-900">{module.title}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{module.title}</h2>
          {module.description && (
            <p className="mt-1 text-sm text-slate-500">{module.description}</p>
          )}
          <p className="mt-1 text-sm text-slate-500">
            Ordem {module.orderIndex} · {brl.format(module.priceCents / 100)} ·{' '}
            {module.lessons.length} aulas
          </p>
          {module.presentationVideoUrl && (
            <a
              href={module.presentationVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Ver vídeo de apresentação
            </a>
          )}
        </div>
        <div className="flex gap-3">
          <Button href={`${hubPath}/edit`} variant="secondary" size="sm">
            Editar Módulo
          </Button>
          <Button href={`${hubPath}/lessons/new`} variant="primary" size="sm">
            + Nova Aula
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {module.lessons.length === 0 ? (
          <Card className="text-center">
            <p className="text-slate-500">Nenhuma aula ainda. Crie a primeira para começar.</p>
            <div className="mt-4">
              <Button href={`${hubPath}/lessons/new`} variant="primary" size="sm">
                Criar primeira aula
              </Button>
            </div>
          </Card>
        ) : (
          module.lessons.map((lesson) => {
            const typeBadge = contentTypeBadge[lesson.contentType];
            const preview = lessonPreview(lesson);
            return (
              <Card key={lesson.id} className="flex items-center gap-6">
                <div className="bg-brand-600 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white">
                  {lesson.orderIndex}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{lesson.title}</h3>
                    {typeBadge && <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>}
                  </div>
                  {preview && <p className="mt-1 truncate text-sm text-slate-500">{preview}</p>}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button href={`${hubPath}/lessons/${lesson.id}/edit`} variant="ghost" size="sm">
                    Editar
                  </Button>
                  <DeleteButton
                    onDelete={deleteLessonAction.bind(null, lesson.id)}
                    confirmMessage={`Excluir a aula "${lesson.title}"?`}
                  />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
