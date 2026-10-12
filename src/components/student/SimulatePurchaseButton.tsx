'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { simulatePurchaseAction } from '@/server/actions/purchases';

type State = { error?: string };

export function SimulatePurchaseButton({ moduleId }: { moduleId: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async () => simulatePurchaseAction(moduleId),
    {},
  );

  return (
    <form action={formAction}>
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        [DEV] Simular compra
      </Button>
      {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
