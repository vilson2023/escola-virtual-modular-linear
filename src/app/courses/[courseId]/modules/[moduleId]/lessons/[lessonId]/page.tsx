import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/session';
import { canAccessModule } from '@/server/services/module-state';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

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
    currentIndex >= 0 && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : null;

  const lessonBasePath = `/courses/${courseId}/modules/${moduleId}/lessons`;

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

        <h1 className="mt-4 text-3xl font-bold text-slate-900">{lesson.title}</h1>

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
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Abrir arquivo em nova aba ↗
                </a>
              </div>
            </Card>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          {previousLesson ? (
            <Button
              href={`${lessonBasePath}/${previousLesson.id}`}
              variant="secondary"
              size="sm"
            >
              ← Aula anterior
            </Button>
          ) : (
            <span />
          )}
          {nextLesson && (
            <Button href={`${lessonBasePath}/${nextLesson.id}`} variant="primary" size="sm">
              Próxima aula →
            </Button>
          )}
        </div>
      </Container>
    </div>
  );
}
