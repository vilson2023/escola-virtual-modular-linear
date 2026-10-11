import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';

const features = [
  {
    icon: '🎯',
    title: 'Linear por design',
    description: 'Um módulo conduz ao próximo. Sem bagunça, sem escolha paralela.',
  },
  {
    icon: '💰',
    title: 'Pague pelo progresso',
    description: 'Compre só o próximo módulo quando estiver pronto. Sem assinatura.',
  },
  {
    icon: '🏆',
    title: 'Certificado único',
    description: 'Conclua todos os módulos e receba um certificado ao final da jornada.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed inset-x-0 top-0 border-b border-slate-100 bg-white/80 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/" />
          <div className="flex items-center gap-2">
            <Button href="/login" variant="ghost" size="sm">
              Entrar
            </Button>
            <Button href="/register" variant="primary" size="sm">
              Criar conta
            </Button>
          </div>
        </Container>
      </header>

      <main>
        <section className="pt-36 pb-20">
          <Container className="text-center">
            <Badge variant="brand">Novo · Pagamento por progresso</Badge>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Aprenda no seu ritmo. Pague pelo seu{' '}
              <span className="text-brand-600">progresso</span>.
            </h1>
            <p className="mt-4 text-lg font-medium text-slate-600">
              Sua jornada, módulo a módulo.
            </p>
            <p className="mx-auto mt-2 max-w-xl text-base text-slate-500">
              Compre um módulo por vez. Conclua 100%. Destrave o próximo. Certificado no final.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button href="/register" variant="primary" size="lg">
                Começar agora
              </Button>
              <Button href="/login" variant="secondary" size="lg">
                Já tenho conta
              </Button>
            </div>
          </Container>
        </section>

        <section className="pb-20">
          <Container>
            <div className="grid gap-6 sm:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <div className="text-3xl">{feature.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{feature.description}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8">
        <Container>
          <p className="text-center text-sm text-slate-400">
            © 2026 dumo. Todos os direitos reservados.
          </p>
        </Container>
      </footer>
    </div>
  );
}
