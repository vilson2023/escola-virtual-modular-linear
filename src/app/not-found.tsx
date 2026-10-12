import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-100">
        <Container className="flex h-16 items-center">
          <Logo href="/" />
        </Container>
      </header>

      <main className="flex flex-1 items-center">
        <Container className="py-16 text-center">
          <p className="text-brand-600 font-mono text-sm font-semibold tracking-widest">404</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Página não encontrada
          </h1>
          <p className="mx-auto mt-4 max-w-md text-slate-500">
            O endereço pode ter mudado ou não existe. Mas a sua jornada continua — módulo a módulo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/" variant="primary" className="w-full sm:w-auto">
              Voltar para a home
            </Button>
            <Button href="/dashboard" variant="secondary" className="w-full sm:w-auto">
              Ir para meu painel
            </Button>
          </div>
          <p className="mt-10 text-sm text-slate-400">
            Procurando algo?{' '}
            <Link href="/login" className="text-brand-600 hover:underline">
              Entre na sua conta
            </Link>
            .
          </p>
        </Container>
      </main>
    </div>
  );
}
