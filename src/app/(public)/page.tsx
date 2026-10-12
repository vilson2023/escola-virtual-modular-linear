import { auth } from '@/lib/auth';
import { getCourseCards } from '@/server/services/catalog';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { CourseCard } from '@/components/course/CourseCard';

const benefits = [
  {
    icon: '💰',
    title: 'Comece com um investimento menor',
    description: 'Adquira só o primeiro módulo e comece hoje mesmo.',
  },
  {
    icon: '📚',
    title: 'Aprenda e aplique cada etapa',
    description: 'Cada módulo é uma etapa completa, com aulas práticas.',
  },
  {
    icon: '🚀',
    title: 'Escolha quando avançar',
    description: 'Destrave o próximo módulo quando estiver pronto.',
  },
];

const steps = [
  {
    title: 'Escolha seu curso',
    description: 'Encontre o curso que faz sentido para você.',
  },
  {
    title: 'Compre módulo a módulo',
    description: 'Pague apenas pelo que for consumir. Cada módulo tem seu preço.',
  },
  {
    title: 'Avance no seu ritmo',
    description: 'Conclua cada etapa e desbloqueie a próxima quando estiver pronto.',
  },
];

export default async function Home() {
  const [session, courses] = await Promise.all([auth(), getCourseCards()]);
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <main>
      {/* Hero compacto */}
      <section className="border-b border-slate-200 bg-white">
        <Container className="py-14 text-center sm:py-20">
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Aprenda por módulos. Avance no seu ritmo.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            No Dumo, você não precisa comprar uma formação inteira para começar. Escolha um curso,
            adquira os módulos que fazem sentido para você e avance conforme seu aprendizado.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/courses" variant="primary" size="lg" className="w-full sm:w-auto">
              Explorar cursos
            </Button>
            <Button
              href="/#como-funciona"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Como funciona
            </Button>
          </div>
        </Container>
      </section>

      {/* Benefícios */}
      <section className="bg-white">
        <Container className="py-12">
          <div className="grid gap-6 sm:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {b.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{b.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Vitrine de cursos */}
      <section className="py-12 sm:py-16">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Cursos para desenvolver suas habilidades
          </h2>

          {courses.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-lg font-medium text-slate-700">Em breve</p>
              <p className="mt-1 text-sm text-slate-500">
                Ainda não há cursos disponíveis. Volte em breve!
              </p>
              {isAdmin && (
                <Button href="/admin/courses/new" variant="primary" className="mt-6">
                  Criar o primeiro curso →
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="scroll-mt-24 border-t border-slate-200 bg-white py-16">
        <Container>
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Como funciona
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <span className="text-brand-600 text-sm font-bold">Passo {i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{s.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
