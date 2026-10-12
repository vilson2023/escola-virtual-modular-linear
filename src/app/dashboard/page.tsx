import { signOut } from '@/lib/auth';
import { requireAuth } from '@/server/auth/session';
import { getCertificatesForStudent } from '@/server/services/certificate';
import { prisma } from '@/lib/prisma';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';

export const metadata = { title: 'Meu painel' };

export default async function DashboardPage() {
  const user = await requireAuth();

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      modules: {
        orderBy: { orderIndex: 'asc' },
        select: { id: true },
      },
    },
  });

  const purchases = await prisma.studentPurchase.findMany({
    where: { userId: user.id, statusPayment: 'PAID' },
    select: { moduleId: true },
  });
  const purchasedModuleIds = new Set(purchases.map((p) => p.moduleId));

  const certificates = await getCertificatesForStudent(user.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/" />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:inline">{user.name}</span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <Button type="submit" variant="ghost" size="sm" aria-label="Sair da conta">
                Sair
              </Button>
            </form>
          </div>
        </Container>
      </header>

      <Container className="py-8 sm:py-12">
        <h1 className="text-3xl font-bold text-slate-900">Olá, {user.name} 👋</h1>
        <p className="mt-2 text-slate-500">Continue de onde parou.</p>

        <div className="mt-8 space-y-6">
          {user.role === 'ADMIN' && (
            <Card className="border-brand-200 bg-brand-50">
              <h2 className="text-lg font-semibold text-slate-900">Você é administrador</h2>
              <p className="mt-1 text-sm text-slate-600">
                Gerencie cursos, módulos e alunos no painel administrativo.
              </p>
              <div className="mt-4">
                <Button href="/admin" variant="primary" size="sm">
                  Ir para o Painel Admin →
                </Button>
              </div>
            </Card>
          )}

          {certificates.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Seus certificados</h2>
              <div className="mt-4 space-y-4">
                {certificates.map((cert) => (
                  <Card
                    key={cert.id}
                    className="flex flex-wrap items-center gap-6 border-emerald-200 bg-emerald-50"
                  >
                    <span className="text-2xl" aria-hidden>
                      🎓
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{cert.course.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Código <span className="font-mono">{cert.code}</span> · emitido em{' '}
                        {cert.issuedAt.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      href={`/courses/${cert.courseId}/certificate`}
                      variant="primary"
                      size="sm"
                    >
                      Ver certificado →
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Meus Cursos</h2>{' '}
            <div className="mt-4 space-y-4">
              {courses.length === 0 ? (
                <Card className="text-center">
                  <p className="text-slate-500">Ainda não há cursos disponíveis.</p>
                </Card>
              ) : (
                courses.map((course) => {
                  const owned = course.modules.filter((m) => purchasedModuleIds.has(m.id)).length;
                  return (
                    <Card key={course.id} className="flex flex-wrap items-center gap-6">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
                        {course.description && (
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {course.description}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-slate-500">
                          {course.modules.length} módulos · você possui {owned}
                        </p>
                      </div>
                      <Button href={`/courses/${course.id}`} variant="primary" size="sm">
                        Continuar
                      </Button>
                    </Card>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
