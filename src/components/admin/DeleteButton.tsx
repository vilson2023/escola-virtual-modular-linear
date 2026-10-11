'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/Button';

type Props = {
  onDelete: () => Promise<void>;
  confirmMessage: string;
  label?: string;
};

export function DeleteButton({ onDelete, confirmMessage, label = 'Excluir' }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      await onDelete();
    });
  }

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? 'Excluindo...' : label}
    </Button>
  );
}
