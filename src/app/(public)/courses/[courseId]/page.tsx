import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCourseModulesForStudent } from '@/server/services/module-state';
import { Container } from '@/components/ui/Container';
import { CourseTabs } from '@/components/course/CourseTabs';
import { ModuleCard } from '@/components/course/ModuleCard';
import { ProgressCard } from '@/components/course/ProgressCard';
import { InfoCard } from '@/components/course/InfoCard';

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true },
  });
  return { title: course ? course.title : 'Curso' };
}

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) notFound();

  // A página é pública: anônimos veem os módulos como "Disponível/Bloqueado".
  // Para anônimos usamos um userId inexistente — sem compras nem progresso,
  // o backend retorna o estado natural da fila (M1 VITRINE, demais BLOQUEADO).
  const session = await auth();
  const userId = session?.user?.id ?? crypto.randomUUID();
  const isLoggedIn = !!session?.user;

  const modules = await getCourseModulesForStudent(userId, courseId);

  const sobreContent = (
    <div className="space-y-8">
      <section>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span aria-hidden>🎯</span> O que você vai aprender
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed whitespace-pre-line text-slate-600">
          {course.learningObjectives ?? course.description ?? ''}
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span aria-hidden>👤</span> Para quem é este curso
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {course.targetAudience ?? 'Qualquer pessoa interessada no tema.'}
        </p>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span aria-hidden>📖</span> Conhecimentos necessários
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {course.prerequisites ?? 'Nenhum pré-requisito.'}
        </p>
      </section>

      {course.skills && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <span aria-hidden>✅</span> Habilidades que você vai desenvolver
          </h2>
          <ul className="mt-3 space-y-2">
            {course.skills.split(',').map((s) => (
              <li key={s.trim()} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-emerald-600">✓</span> {s.trim()}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );

  const modulosContent = (
    <div>
      <h2 className="text-lg font-bold text-slate-900">Módulos do curso</h2>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        {modules.length} módulo{modules.length === 1 ? '' : 's'} no total
      </p>
      <div className="space-y-4">
        {modules.map((m, i) => (
          <ModuleCard key={m.id} module={m} index={i + 1} courseId={courseId} />
        ))}
      </div>
    </div>
  );

  return (
    <main>
      {/* Hero do curso */}
      <section className="bg-gradient-to-r from-[#0B3D4F] to-[#0F5468] py-10 text-white">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              {course.category && (
                <span className="rounded-md bg-blue-500/90 px-2 py-1 text-xs font-semibold text-white">
                  {course.category}
                </span>
              )}
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{course.title}</h1>
              <p className="mt-4 max-w-2xl text-white/80">
                {course.shortDescription ?? course.description ?? ''}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
                <span>📚 {modules.length} módulos</span>
                <span>♾️ Acesso vitalício</span>
                {course.hasCertificate && <span>🏆 Certificado de conclusão</span>}
              </div>
            </div>
            {course.coverImageUrl && (
              <div className="hidden lg:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.coverImageUrl}
                  alt={course.title}
                  className="w-full max-w-md rounded-2xl shadow-2xl"
                />
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Corpo: coluna principal + sidebar */}
      <Container className="py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <CourseTabs sobre={sobreContent} modulos={modulosContent} />
          </div>

          <aside className="h-fit space-y-4 lg:sticky lg:top-24">
            <ProgressCard
              courseId={courseId}
              modules={modules}
              isLoggedIn={isLoggedIn}
              hasCertificate={course.hasCertificate}
            />
            <InfoCard
              icon="🛡️"
              title="Aprendizado seguro"
              text="Seus pagamentos são processados com segurança e seu acesso é liberado apenas após a confirmação do pagamento."
            />
            {course.hasCertificate && (
              <InfoCard
                icon="🏆"
                title="Certificado de conclusão"
                text="Ao concluir todos os módulos, você recebe um certificado digital de conclusão do curso."
              />
            )}
          </aside>
        </div>
      </Container>
    </main>
  );
}
