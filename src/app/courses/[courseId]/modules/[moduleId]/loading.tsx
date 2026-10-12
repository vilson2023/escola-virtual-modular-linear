import { Container } from '@/components/ui/Container';

export default function Loading() {
  return (
    <Container className="py-10" aria-busy="true" aria-label="Carregando módulo">
      <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-9 w-1/2 animate-pulse rounded bg-slate-200" />
      <div className="mt-6 aspect-video w-full max-w-2xl animate-pulse rounded-xl bg-slate-200" />
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-200" />
        ))}
      </div>
    </Container>
  );
}
