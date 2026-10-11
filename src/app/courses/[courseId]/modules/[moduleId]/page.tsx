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

  const completedLessons = await prisma.studentProgress.findMany({
    where: { userId: user.id, completed: true, lesson: { moduleId } },
    select: { lessonId: true },
  });
  const completedSet = new Set(completedLessons.map((p) => p.lessonId));

  const totalLessons = module.lessons.length;
  const completedCount = completedSet.size;
  const percent =
    totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
  const moduleComplete = totalLessons > 0 && percent === 100;

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
          <p className="mt-4 text-sm text-slate-500">
            {completedCount} de {totalLessons} aulas concluídas ({percent}%)
          </p>
          <div className="mt-2 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {moduleComplete && (
          <Card className="mt-6 border-brand-200 bg-brand-50 text-center">
            <p className="text-xl font-bold text-slate-900">🎉 Módulo concluído!</p>
            <p className="mt-2 text-sm text-slate-600">
              Volte para o curso para ver o próximo módulo na vitrine.
            </p>
            <div className="mt-4">
              <Button href={`/courses/${courseId}`} variant="primary" size="sm">
                Ver próximo módulo
              </Button>
            </div>
          </Card>
        )}

        <div className="mt-8 space-y-4">
          {module.lessons.length === 0 ? (
            <Card className="text-center">
              <p className="text-slate-500">Nenhuma aula neste módulo ainda.</p>
            </Card>
          ) : (
            module.lessons.map((lesson) => {
              const typeBadge = contentTypeBadge[lesson.contentType];
              const completed = completedSet.has(lesson.id);
              return (
                <Card key={lesson.id} className="flex items-center gap-6">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                      completed
                        ? 'bg-brand-600 text-white'
                        : 'border-2 border-slate-300 text-slate-400'
                    }`}
                    title={completed ? 'Concluída' : 'Pendente'}
                  >
                    {completed ? '✓' : '○'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`font-semibold ${
                          completed ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}
                      >
                        {lesson.title}
                      </h3>
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
