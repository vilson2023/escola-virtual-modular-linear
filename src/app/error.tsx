'use client';

import { useEffect } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log interno para investigação — não expõe nada ao cliente.
    console.error(error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-100">
        <Container className="flex h-16 items-center">
          <Logo href="/" />
        </Container>
      </header>

      <main className="flex flex-1 items-center">
        <Container className="py-16 text-center">
          <p className="text-brand-600 font-mono text-sm font-semibold tracking-widest">Erro</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Algo deu errado</h1>
          <p className="mx-auto mt-4 max-w-md text-slate-500">
            Não foi possível carregar esta página. Tente de novo — se continuar, volte mais tarde.
          </p>
          {isDev && (
            <pre className="mx-auto mt-6 max-w-lg overflow-auto rounded-lg bg-slate-100 p-4 text-left text-xs text-slate-700">
              {error.message}
              {error.digest ? `\ndigest: ${error.digest}` : ''}
            </pre>
          )}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button type="button" variant="primary" onClick={reset} className="w-full sm:w-auto">
              Tentar de novo
            </Button>
            <Button href="/" variant="secondary" className="w-full sm:w-auto">
              Voltar para a home
            </Button>
          </div>
        </Container>
      </main>
    </div>
  );
}
