import { Logo } from '@/components/ui/Logo';
import { Container } from '@/components/ui/Container';
import { GradientText } from '@/components/ui/GradientText';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { FeatureIcon } from '@/components/ui/FeatureIcon';

const steps = [
  {
    icon: '🎯',
    title: 'Escolha seu módulo',
    description: 'Você compra um módulo por vez. Sem assinatura, sem enrolação.',
  },
  {
    icon: '🚀',
    title: 'Avance no seu ritmo',
    description: 'Conclua 100% das aulas e destrave o próximo na hora.',
  },
  {
    icon: '🏆',
    title: 'Receba seu certificado',
    description: 'Termine tudo e receba um certificado único ao final da jornada.',
  },
];

const benefits = [
  { icon: '💸', label: 'Pague só o que consumir' },
  { icon: '🔒', label: 'Conteúdo sequencial inteligente' },
  { icon: '⚡', label: 'Liberação instantânea' },
  { icon: '📱', label: 'Acesse de qualquer dispositivo' },
];

const prices = [
  { module: 'Módulo 1', title: 'Introdução', price: 'R$ 97' },
  { module: 'Módulo 2', title: 'Prática', price: 'R$ 147', featured: true },
  { module: 'Módulo 3', title: 'Avançado', price: 'R$ 197' },
];

export default function Home() {
  return (
    <div className="bg-night-950 min-h-screen text-white">
      {/* Header fixo */}
      <header className="bg-night-950/60 border-brand-500/10 fixed inset-x-0 top-0 z-10 border-b backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/" variant="light" />
          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <a href="#como" className="hover:text-white">
              Como funciona
            </a>
            <a href="#precos" className="hover:text-white">
              Preços
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <NeonButton href="/login" variant="ghost" size="sm">
              Entrar
            </NeonButton>
            <NeonButton href="/register" variant="primary" size="sm">
              Começar agora
            </NeonButton>
          </div>
        </Container>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-night-gradient relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="grid-bg absolute inset-0" aria-hidden />
          <Container className="relative text-center">
            <span className="glass text-accent-300 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
              ✨ Novo · Pagamento por progresso
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
              Aprenda no seu ritmo.
              <br />
              Pague pelo seu <GradientText>progresso</GradientText>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-white/60">
              Sua jornada, módulo a módulo. Compre um por vez, conclua 100%, destrave o próximo.
              Certificado no final.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <NeonButton href="/register" variant="primary" size="lg" className="w-full sm:w-auto">
                Começar agora
              </NeonButton>
              <NeonButton href="/login" variant="glass" size="lg" className="w-full sm:w-auto">
                Já tenho conta
              </NeonButton>
            </div>

            {/* Mockup do dashboard (SVG estilizado) */}
            <div className="relative mx-auto mt-16 max-w-3xl">
              <div className="border-brand-500/30 bg-night-900/80 shadow-glow-brand rounded-2xl border p-4 text-left backdrop-blur sm:p-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                  <span className="bg-brand-500 h-2.5 w-2.5 rounded-full" />
                  <span className="bg-accent-400/70 h-2.5 w-2.5 rounded-full" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="ml-3 text-xs text-white/40">dumo · meu painel</span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Módulo 1 · Introdução', width: '100%', tone: 'brand' },
                    { label: 'Módulo 2 · Prática', width: '100%', tone: 'accent' },
                    { label: 'Módulo 3 · Avançado', width: '30%', tone: 'muted' },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="rounded-xl border border-white/5 bg-white/[0.03] p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/80">{row.label}</span>
                        <span
                          className={`text-xs ${row.tone === 'muted' ? 'text-white/30' : 'text-accent-300'}`}
                        >
                          {row.tone === 'muted' ? '🔒 bloqueado' : '✓ liberado'}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className={`h-full rounded-full ${
                            row.tone === 'accent'
                              ? 'from-accent-500 to-accent-400 bg-gradient-to-r'
                              : row.tone === 'brand'
                                ? 'from-brand-600 to-brand-400 bg-gradient-to-r'
                                : 'bg-white/10'
                          }`}
                          style={{ width: row.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Como funciona */}
        <section id="como" className="scroll-mt-24 py-20 sm:py-28">
          <Container>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Como o <GradientText>dumo</GradientText> funciona
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, i) => (
                <GlassCard key={step.title}>
                  <span className="text-accent-300 text-sm font-semibold">Passo {i + 1}</span>
                  <div className="mt-4">
                    <FeatureIcon>{step.icon}</FeatureIcon>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{step.description}</p>
                </GlassCard>
              ))}
            </div>
          </Container>
        </section>

        {/* Benefícios */}
        <section className="py-8 sm:py-12">
          <Container>
            <div className="glass rounded-3xl p-8 sm:p-10">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {benefits.map((b, i) => (
                  <div key={b.label} className="flex items-center gap-3">
                    <FeatureIcon color={i % 2 === 0 ? 'brand' : 'accent'}>{b.icon}</FeatureIcon>
                    <p className="text-sm font-medium text-white/80">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Preços */}
        <section id="precos" className="scroll-mt-24 py-20 sm:py-28">
          <Container>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Preços <GradientText>transparentes</GradientText>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-white/60">
              Você paga por módulo, não por assinatura.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {prices.map((p) => (
                <GlassCard key={p.module} className={p.featured ? 'border-brand-500/40' : ''}>
                  <p className="text-sm font-medium text-white/50">{p.module}</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{p.title}</h3>
                  <p className="mt-4 text-4xl font-bold tracking-tight">
                    <GradientText>{p.price}</GradientText>
                  </p>
                  <p className="mt-2 text-xs text-white/40">pagamento único</p>
                  <NeonButton
                    href="/register"
                    variant={p.featured ? 'primary' : 'ghost'}
                    className="mt-6 w-full"
                  >
                    Começar agora
                  </NeonButton>
                </GlassCard>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA final */}
        <section className="pb-24 sm:pb-32">
          <Container>
            <GlassCard className="text-center" hover={false}>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Pronto para <GradientText>começar</GradientText>?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/60">
                Sua jornada começa com o primeiro clique.
              </p>
              <NeonButton href="/register" variant="primary" size="lg" className="mt-8">
                Criar minha conta
              </NeonButton>
            </GlassCard>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo variant="light" size="sm" />
          <p className="text-sm text-white/40">© 2026 dumo. Sua jornada, módulo a módulo.</p>
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
    </div>
  );
}
