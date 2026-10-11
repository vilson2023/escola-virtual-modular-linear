import { requireRole } from '@/server/auth/session';
import { AsaasTestPanel } from './AsaasTestPanel';
import { EnvDiagnosticPanel } from './EnvDiagnosticPanel';

export default async function PaymentTestPage() {
  await requireRole('ADMIN');

  if (process.env.NODE_ENV === 'production') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Teste de pagamento</h2>
        <p className="mt-2 text-sm text-slate-500">Indisponível em produção.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Teste de pagamento</h2>
      <p className="mt-1 text-sm text-slate-500">
        Cria um cliente de teste no Asaas Sandbox para validar a conexão. [DEV]
      </p>
      <div className="mt-6 space-y-6">
        <EnvDiagnosticPanel />
        <AsaasTestPanel />
      </div>
    </div>
  );
}
