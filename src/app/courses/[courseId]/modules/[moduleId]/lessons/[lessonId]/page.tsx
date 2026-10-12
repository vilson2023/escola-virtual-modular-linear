import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/session';
import { canAccessModule } from '@/server/services/module-state';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { LessonActions } from '@/components/student/LessonActions';

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
}) {
  const user = await requireAuth();
  const { courseId, moduleId, lessonId } = await params;

  const allowed = await canAccessModule(user.id, moduleId);
  if (!allowed) redirect(`/courses/${courseId}`);

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: true,
          lessons: { orderBy: { orderIndex: 'asc' }, select: { id: true } },
        },
      },
    },
  });
  if (!lesson || lesson.moduleId !== moduleId || lesson.module.courseId !== courseId) {
    notFound();
  }

  const lessons = lesson.module.lessons;
  const currentIndex = lessons.findIndex((l) => l.id === lesson.id);
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const lessonBasePath = `/courses/${courseId}/modules/${moduleId}/lessons`;

  // Progresso do módulo para este aluno
  const [progress, completedCount] = await Promise.all([
    prisma.studentProgress.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId } },
    }),
    prisma.studentProgress.count({
      where: { userId: user.id, completed: true, lesson: { moduleId } },
    }),
  ]);
  const totalLessons = lessons.length;
  const percent = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
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
            {lesson.module.course.title}
          </Link>
          {' / '}
          <Link href={`/courses/${courseId}/modules/${moduleId}`} className="hover:text-slate-700">
            {lesson.module.title}
          </Link>
          {' / '}
          <span className="font-medium text-slate-900">{lesson.title}</span>
        </nav>

        <div className="mt-4">
          <p className="text-sm text-slate-500">
            {completedCount} de {totalLessons} aulas concluídas ({percent}%)
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="bg-brand-600 h-full rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">{lesson.title}</h1>

        <div className="mt-8">
          {lesson.contentType === 'VIDEO' && lesson.videoUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={lesson.videoUrl}
                title={lesson.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {lesson.contentType === 'TEXT' && (
            <Card>
              <div className="whitespace-pre-wrap text-slate-700">{lesson.textContent}</div>
            </Card>
          )}

          {lesson.contentType === 'FILE' && lesson.fileUrl && (
            <Card className="text-center">
              <p className="text-4xl" aria-hidden>
                📄
              </p>
              <p className="mt-2 text-sm text-slate-500">{lesson.title}</p>
              <div className="mt-4">
                <a
                  href={lesson.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-600 hover:bg-brand-700 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition"
                >
                  Abrir arquivo em nova aba ↗
                </a>
              </div>
            </Card>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          {previousLesson ? (
            <Button href={`${lessonBasePath}/${previousLesson.id}`} variant="ghost" size="sm">
              ← Aula anterior
            </Button>
          ) : (
            <span />
          )}
          <Button href={`/courses/${courseId}/modules/${moduleId}`} variant="ghost" size="sm">
            Voltar ao módulo
          </Button>
        </div>

        <div className="mt-6">
          <LessonActions
            lessonId={lesson.id}
            initialCompleted={progress?.completed ?? false}
            nextLessonHref={nextLesson ? `${lessonBasePath}/${nextLesson.id}` : undefined}
          />
        </div>

        {moduleComplete && (
          <Card className="border-brand-200 bg-brand-50 mt-8 text-center">
            <p className="text-2xl font-bold text-slate-900">🎉 Você concluiu este módulo!</p>
            <p className="mt-2 text-sm text-slate-600">
              O próximo módulo já está disponível na vitrine.
            </p>
            <div className="mt-4">
              <Button href={`/courses/${courseId}`} variant="primary">
                Ver próximo módulo
              </Button>
            </div>
          </Card>
        )}
      </Container>
    </div>
  );
}
