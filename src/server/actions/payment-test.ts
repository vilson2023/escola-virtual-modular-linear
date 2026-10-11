'use server';

import { requireRole } from '@/server/auth/session';
import { getPaymentProvider } from '@/server/payments';

export type AsaasTestResult =
  | { ok: true; customerId: string; customerName: string }
  | { ok: false; error: string };

export async function testAsaasConnectionAction(): Promise<AsaasTestResult> {
  await requireRole('ADMIN');

  if (process.env.NODE_ENV === 'production') {
    return { ok: false, error: 'Teste indisponível em produção' };
  }

  try {
    const provider = getPaymentProvider();
    const testCustomer = await provider.createCustomer({
      name: 'Teste dumo',
      email: `teste+dumo${Date.now()}@example.com`,
      externalReference: 'test-connection',
    });

    return {
      ok: true,
      customerId: testCustomer.id,
      customerName: testCustomer.name,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido',
    };
  }
}
