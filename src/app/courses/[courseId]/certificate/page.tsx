import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/server/auth/session';
import { getOrCreateCertificate } from '@/server/services/certificate';
import { prisma } from '@/lib/prisma';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { PrintCertificateButton } from '@/components/student/PrintCertificateButton';

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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/" />
          <Button href={`/courses/${courseId}`} variant="ghost" size="sm">
            ← Voltar ao curso
          </Button>
        </Container>
      </header>

      <Container className="py-12">
        <div className="mx-auto max-w-3xl">
          {/* Certificado */}
          <div
            id="certificate"
            className="border-brand-500 shadow-card rounded-2xl border-4 border-double bg-white px-8 py-14 text-center sm:px-14"
          >
            <p className="text-brand-600 text-sm font-semibold tracking-[0.3em] uppercase">dumo</p>
            <h1 className="mt-6 font-serif text-4xl font-bold text-slate-900 sm:text-5xl">
              Certificado
            </h1>
            <div className="bg-brand-400 mx-auto mt-6 h-px w-24" />
            <p className="mt-8 text-slate-500">Certificamos que</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{user.name}</p>
            <p className="mx-auto mt-6 max-w-xl text-slate-600">
              concluiu com êxito o curso{' '}
              <span className="font-semibold text-slate-900">{course.title}</span> na plataforma
              dumo.
            </p>
            <div className="mx-auto mt-10 flex max-w-md items-center justify-between gap-8 text-left">
              <div>
                <p className="text-xs tracking-wider text-slate-400 uppercase">Emitido em</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{issuedAt}</p>
              </div>
              <div className="text-right">
                <p className="text-xs tracking-wider text-slate-400 uppercase">Código</p>
                <p className="text-brand-700 mt-1 font-mono text-sm font-semibold">
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
