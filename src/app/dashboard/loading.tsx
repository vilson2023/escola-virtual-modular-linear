import { Container } from '@/components/ui/Container';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Carregando painel">
      <header className="border-b border-slate-200 bg-white">
        <Container className="flex h-16 items-center justify-between">
          <div className="h-7 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-200" />
        </Container>
      </header>
      <Container className="py-8 sm:py-12">
        <div className="h-9 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-5 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-8 space-y-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="shadow-card rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
            >
              <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
