import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/session';
import { canAccessModule } from '@/server/services/module-state';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';

const contentTypeBadge: Record<string, { label: string; variant: 'brand' | 'neutral' | 'warning' }> = {
  VIDEO: { label: 'Vídeo', variant: 'brand' },
  TEXT: { label: 'Texto', variant: 'neutral' },
  FILE: { label: 'Arquivo', variant: 'warning' },
};

export default async function StudentModulePage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const user = await requireAuth();
  const { courseId, moduleId } = await params;

  const allowed = await canAccessModule(user.id, moduleId);
  if (!allowed) redirect(`/courses/${courseId}`);

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: true,
      lessons: { orderBy: { orderIndex: 'asc' } },
    },
  });
  if (!module || module.courseId !== courseId) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <Container className="py-10">
        <nav className="text-sm text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-700">
            Meus Cursos
          </Link>
          {' / '}
          <Link href={`/courses/${courseId}`} className="hover:text-slate-700">
            {module.course.title}
          </Link>
          {' / '}
          <span className="font-medium text-slate-900">{module.title}</span>
        </nav>

        <div className="mt-4">
          <h1 className="text-3xl font-bold text-slate-900">{module.title}</h1>
          {module.description && (
            <p className="mt-2 text-slate-500">{module.description}</p>
          )}
        </div>

        <div className="mt-8 space-y-4">
          {module.lessons.length === 0 ? (
            <Card className="text-center">
              <p className="text-slate-500">Nenhuma aula neste módulo ainda.</p>
            </Card>
          ) : (
            module.lessons.map((lesson) => {
              const typeBadge = contentTypeBadge[lesson.contentType];
              return (
                <Card key={lesson.id} className="flex items-center gap-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                    {lesson.orderIndex}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{lesson.title}</h3>
                      {typeBadge && <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>}
                    </div>
                  </div>
                  <Button
                    href={`/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
                    variant="primary"
                    size="sm"
                  >
                    Abrir
                  </Button>
                </Card>
              );
            })
          )}
        </div>
      </Container>
    </div>
  );
}
