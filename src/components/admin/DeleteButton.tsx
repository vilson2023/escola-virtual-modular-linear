'use client';

import { useTransition } from 'react';

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
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {pending ? 'Excluindo...' : label}
    </button>
  );
}
