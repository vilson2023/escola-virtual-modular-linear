import { Container } from '@/components/ui/Container';

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Carregando painel administrativo">
      <header className="border-b border-slate-200 bg-white">
        <Container className="flex h-16 items-center justify-between">
          <div className="h-7 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        </Container>
      </header>
      <Container className="py-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 p-4">
              <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-16 animate-pulse rounded bg-slate-200" />
              <div className="ml-auto h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
