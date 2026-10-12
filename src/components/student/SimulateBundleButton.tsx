'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { simulateBundlePurchaseAction } from '@/server/actions/purchases';

type State = { error?: string };

export function SimulateBundleButton({ courseId }: { courseId: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async () => simulateBundlePurchaseAction(courseId),
    {},
  );

  return (
    <form action={formAction}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="w-full sm:w-auto"
        aria-label="Simular compra da formação completa (somente desenvolvimento)"
      >
        [DEV] Simular bundle
      </Button>
      {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
