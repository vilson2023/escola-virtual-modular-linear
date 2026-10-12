import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/server/auth/session';
import { getOrCreateCertificate } from '@/server/services/certificate';
import { prisma } from '@/lib/prisma';
import { Logo } from '@/components/ui/Logo';
import { NeonButton } from '@/components/ui/NeonButton';
import { GradientText } from '@/components/ui/GradientText';
import { Container } from '@/components/ui/Container';
import { PrintCertificateButton } from '@/components/student/PrintCertificateButton';

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true },
  });
  return { title: course ? `Certificado — ${course.title}` : 'Certificado' };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await requireAuth();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) notFound();

  const certificate = await getOrCreateCertificate(user.id, courseId);
  if (!certificate) {
    // Ainda não tem direito: volta para o curso
    redirect(`/courses/${courseId}`);
  }

  const issuedAt = certificate.issuedAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-night-gradient print-dark-page min-h-screen text-white">
      <header className="bg-night-950/60 border-b border-white/5 backdrop-blur-xl print:hidden">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/" variant="light" />
          <NeonButton href={`/courses/${courseId}`} variant="ghost" size="sm">
            ← Voltar ao curso
          </NeonButton>
        </Container>
      </header>

      <Container className="py-12">
        <div className="mx-auto max-w-3xl">
          {/* Certificado */}
          <div
            id="certificate"
            className="print-dark-card glass shadow-glow-brand relative rounded-2xl border-4 border-double border-amber-400/40 px-4 py-10 text-center sm:px-14 sm:py-14"
          >
            <p className="text-accent-300 text-sm font-semibold tracking-[0.3em] uppercase">dumo</p>
            <h1 className="mt-6 font-serif text-3xl font-bold text-white sm:text-5xl">
              Certificado
            </h1>
            <div className="bg-gradient-brand mx-auto mt-6 h-px w-24" />
            <p className="mt-8 text-white/50">Certificamos que</p>
            <p className="mt-2 text-xl font-bold sm:text-3xl">
              <GradientText>{user.name}</GradientText>
            </p>
            <p className="mx-auto mt-6 max-w-xl text-white/70">
              concluiu com êxito o curso{' '}
              <span className="font-semibold text-white">{course.title}</span> na plataforma dumo.
            </p>
            <div className="mx-auto mt-10 flex max-w-md items-center justify-between gap-8 text-left">
              <div>
                <p className="text-xs tracking-wider text-white/40 uppercase">Emitido em</p>
                <p className="mt-1 text-sm font-medium text-white/80">{issuedAt}</p>
              </div>
              <div className="text-right">
                <p className="text-xs tracking-wider text-white/40 uppercase">Código</p>
                <p className="text-accent-300 mt-1 font-mono text-sm font-semibold">
                  {certificate.code}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center print:hidden">
            <PrintCertificateButton />
          </div>
        </div>
      </Container>
    </div>
  );
}
