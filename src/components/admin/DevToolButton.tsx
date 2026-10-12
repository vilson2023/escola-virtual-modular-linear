'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';

type State = { ok?: boolean; message?: string; error?: string } | null;

type Props = {
  action: () => Promise<{ ok: true; message: string } | { error: string }>;
  label: string;
  confirmMessage: string;
  variant?: 'primary' | 'secondary' | 'danger';
};

export function DevToolButton({ action, label, confirmMessage, variant = 'secondary' }: Props) {
  const [state, formAction, pending] = useActionState<State, FormData>(async () => {
    if (!window.confirm(confirmMessage)) return null;
    return action();
  }, null);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <Button type="submit" variant={variant} size="sm" disabled={pending} aria-label={label}>
        {pending ? 'Executando...' : label}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-600">{state.message}</p>}
    </form>
  );
}
