import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  resetMyProgressAction,
  deleteMyCertificateAction,
  resetEverythingForMeAction,
  reseedMyUserAction,
} from '@/server/actions/dev-tools';
import { DevToolButton } from '@/components/admin/DevToolButton';

export const metadata = { title: 'Dev Tools' };

export default function DevToolsPage() {
  // Dev-only: em produção esta página não existe
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <div className="max-w-2xl">
      <nav className="text-sm text-slate-500">
        <a href="/admin" className="hover:text-slate-700">
          Admin
        </a>
        {' / '}
        <span className="font-medium text-slate-900">Dev Tools</span>
      </nav>

      <h2 className="mt-4 text-2xl font-bold text-slate-900">Ferramentas de desenvolvimento</h2>
      <p className="mt-2 text-sm text-slate-500">
        Atalhos para preparar o estado do usuário logado durante os testes. Cada ação pede
        confirmação e afeta <span className="font-semibold">apenas o seu usuário</span>. Esta página
        não existe em produção.
      </p>

      <div className="mt-6 space-y-4">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Resetar meu progresso</h3>
          <p className="mt-1 text-sm text-slate-500">
            Apaga todas as aulas concluídas do usuário logado (progresso 0% em tudo).
          </p>
          <div className="mt-4">
            <DevToolButton
              action={resetMyProgressAction}
              label="Resetar progresso"
              confirmMessage="Apagar todo o progresso do seu usuário?"
              variant="danger"
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Apagar meu certificado</h3>
          <p className="mt-1 text-sm text-slate-500">
            Remove os certificados emitidos para o usuário logado.
          </p>
          <div className="mt-4">
            <DevToolButton
              action={deleteMyCertificateAction}
              label="Apagar certificado"
              confirmMessage="Apagar os certificados do seu usuário?"
              variant="danger"
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Resetar tudo do meu usuário</h3>
          <p className="mt-1 text-sm text-slate-500">
            Apaga progresso, compras PENDING e certificados. As compras PAID são mantidas.
          </p>
          <div className="mt-4">
            <DevToolButton
              action={resetEverythingForMeAction}
              label="Resetar tudo"
              confirmMessage="Resetar progresso, compras PENDING e certificados do seu usuário?"
              variant="danger"
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Repopular meu usuário</h3>
          <p className="mt-1 text-sm text-slate-500">
            Estado padrão de teste: M1 e M2 PAID (sem progresso), M3 disponível para compra.
          </p>
          <div className="mt-4">
            <DevToolButton
              action={reseedMyUserAction}
              label="Repopular usuário"
              confirmMessage="Zerar e repopular seu usuário (M1+M2 PAID, M3 sem compra)?"
            />
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Button href="/admin" variant="ghost" size="sm">
          ← Voltar para o painel
        </Button>
      </div>
    </div>
  );
}
