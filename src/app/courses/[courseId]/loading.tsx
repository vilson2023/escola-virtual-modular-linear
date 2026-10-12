import { Container } from '@/components/ui/Container';

export default function Loading() {
  return (
    <Container className="py-10" aria-busy="true" aria-label="Carregando curso">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-9 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-slate-200" />

      <div className="mt-8 space-y-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="shadow-card rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
            </div>
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-1.5 w-full max-w-md animate-pulse rounded-full bg-slate-200" />
            <div className="mt-4 h-9 w-28 animate-pulse rounded-lg bg-slate-200" />
          </div>
        ))}
      </div>
    </Container>
  );
}
