import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/session';
import { getCourseModulesForStudent } from '@/server/services/module-state';
import { simulatePurchaseAction } from '@/server/actions/purchases';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function CourseViewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await requireAuth();
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, description: true },
  });
  if (!course) notFound();

  const modules = await getCourseModulesForStudent(user.id, courseId);

  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
    select: { moduleId: true, title: true, orderIndex: true },
    orderBy: { orderIndex: 'asc' },
  });
  const lessonsByModule = new Map<string, { title: string }[]>();
  for (const l of lessons) {
    const list = lessonsByModule.get(l.moduleId) ?? [];
    list.push({ title: l.title });
    lessonsByModule.set(l.moduleId, list);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Container className="py-10">
        <nav className="text-sm text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-700">
            Meus Cursos
          </Link>
          {' / '}
          <span className="font-medium text-slate-900">{course.title}</span>
        </nav>

        <div className="mt-4">
          <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
          {course.description && (
            <p className="mt-2 text-slate-500">{course.description}</p>
          )}
        </div>

        <div className="mt-8 space-y-6">
          {modules.map((module) => {
            const modulePath = `/courses/${courseId}/modules/${module.id}`;

            if (module.state === 'LIBERADO') {
              return (
                <Card key={module.id} className="border-l-4 border-brand-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">{module.title}</h2>
                    <Badge variant="success">Liberado</Badge>
                    {module.progressPercent === 100 && (
                      <Badge variant="brand">✓ Concluído</Badge>
                    )}
                  </div>
                  {module.description && (
                    <p className="mt-1 text-sm text-slate-500">{module.description}</p>
                  )}
                  <p className="mt-2 text-sm text-slate-500">
                    {module.lessonCount} aulas · {module.progressPercent}% concluído
                  </p>
                  <div className="mt-2 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{ width: `${module.progressPercent}%` }}
                    />
                  </div>
                  <div className="mt-4">
                    <Button href={modulePath} variant="primary" size="sm">
                      Continuar
                    </Button>
                  </div>
                </Card>
              );
            }

            if (module.state === 'VITRINE') {
              return (
                <Card key={module.id} className="ring-2 ring-brand-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">{module.title}</h2>
                    <Badge variant="brand">Disponível</Badge>
                  </div>

                  {module.presentationVideoUrl && (
                    <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg">
                      <iframe
                        src={module.presentationVideoUrl}
                        title={`Apresentação: ${module.title}`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <p className="mt-4 text-2xl font-bold text-slate-900">
                    {brl.format(module.priceCents / 100)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button
                      href={`/courses/${courseId}/checkout/${module.id}`}
                      variant="primary"
                      size="lg"
                    >
                      Quero desbloquear por {brl.format(module.priceCents / 100)}
                    </Button>
                    {process.env.NODE_ENV !== 'production' && (
                      <form action={simulatePurchaseAction.bind(null, module.id)}>
                        <Button type="submit" variant="ghost" size="sm">
                          [DEV] Simular compra
                        </Button>
                      </form>
                    )}
                  </div>

                  {process.env.NODE_ENV !== 'production' && (
                    <p className="mt-3 text-xs text-slate-400">
                      [DEV] Botão "Simular compra" ignora o gateway.
                    </p>
                  )}

                  <ul className="mt-6 space-y-2">
                    {(lessonsByModule.get(module.id) ?? []).map((lesson, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                        <span aria-hidden>🔒</span>
                        <span>{lesson.title}</span>
                      </li>
                    ))}
                    {module.lessonCount === 0 && (
                      <li className="text-sm text-slate-400">
                        <span aria-hidden>🔒</span> Nenhuma aula disponível ainda.
                      </li>
                    )}
                  </ul>
                </Card>
              );
            }

            return (
              <Card key={module.id} className="bg-slate-50 opacity-60">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    🔒
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-500">{module.title}</h2>
                      <Badge variant="neutral">Bloqueado</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      Conclua o módulo anterior para liberar esta apresentação.
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
