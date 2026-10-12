import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export const metadata = { title: 'Sobre o dumo' };

export default function SobrePage() {
  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <Container className="py-14 sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Sobre o dumo
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            O dumo nasceu de uma ideia simples: conhecimento por etapas. Em vez de cobrar uma
            formação inteira de uma só vez, acreditamos que você deve pagar apenas pelo módulo que
            está consumindo — e avançar para o próximo quando estiver pronto.
          </p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            Cada curso é organizado em módulos lineares, com preço visível e liberação progressiva.
            Você conclui uma etapa, aplica o que aprendeu e decide quando dar o próximo passo. No
            final da jornada, seu certificado comprova tudo o que você percorreu.
          </p>
          <div className="mt-8">
            <Button href="/courses" variant="primary" size="lg">
              Explorar cursos
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
