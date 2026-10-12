import { Logo } from '@/components/ui/Logo';
import { Container } from '@/components/ui/Container';

export function Footer() {
  return (
    <footer className="bg-night-950 py-10 text-white">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Logo variant="light" size="sm" />
        <p className="text-sm text-white/40">
          © 2026 dumo. Conhecimento por etapas. Valor em cada módulo.
        </p>
        <nav className="flex gap-5 text-sm text-white/40">
          <a href="#" className="hover:text-white/70">
            Termos
          </a>
          <a href="#" className="hover:text-white/70">
            Privacidade
          </a>
          <a href="#" className="hover:text-white/70">
            Contato
          </a>
        </nav>
      </Container>
    </footer>
  );
}
