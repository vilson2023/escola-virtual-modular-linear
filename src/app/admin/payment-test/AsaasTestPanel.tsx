'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { testAsaasConnectionAction, type AsaasTestResult } from '@/server/actions/payment-test';

export function AsaasTestPanel() {
  const [result, setResult] = useState<AsaasTestResult | null>(null);
  const [pending, startTransition] = useTransition();

  function runTest() {
    setResult(null);
    startTransition(async () => {
      const r = await testAsaasConnectionAction();
      setResult(r);
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Button type="button" variant="primary" onClick={runTest} disabled={pending}>
        {pending ? 'Testando...' : 'Testar conexão com Asaas'}
      </Button>

      {result?.ok && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          ✅ Conectado! Customer ID: <code>{result.customerId}</code>, Nome: {result.customerName}
        </div>
      )}

      {result && !result.ok && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ❌ Erro: {result.error}
        </div>
      )}
    </div>
  );
}
