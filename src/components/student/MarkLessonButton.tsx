'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { markLessonCompleteAction, unmarkLessonCompleteAction } from '@/server/actions/progress';

type Props = {
  lessonId: string;
  initialCompleted: boolean;
  onChange?: (completed: boolean) => void;
};

export function MarkLessonButton({ lessonId, initialCompleted, onChange }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !completed;
    setCompleted(next); // otimista
    setError(null);
    onChange?.(next);
    startTransition(async () => {
      try {
        const result = next
          ? await markLessonCompleteAction(lessonId)
          : await unmarkLessonCompleteAction(lessonId);
        if (result?.error) {
          setCompleted(!next); // rollback em caso de rejeição
          setError(result.error);
          onChange?.(!next);
        }
      } catch {
        setCompleted(!next); // rollback em caso de erro
        setError('Erro ao salvar. Tente novamente.');
        onChange?.(!next);
      }
    });
  }

  return (
    <div>
      <Button
        type="button"
        variant={completed ? 'secondary' : 'primary'}
        size="lg"
        onClick={toggle}
        disabled={pending}
      >
        {pending ? 'Salvando...' : completed ? '✓ Concluída — desmarcar' : 'Marcar como concluída'}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
