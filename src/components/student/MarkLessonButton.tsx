'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import {
  markLessonCompleteAction,
  unmarkLessonCompleteAction,
} from '@/server/actions/progress';

type Props = {
  lessonId: string;
  initialCompleted: boolean;
  onChange?: (completed: boolean) => void;
};

export function MarkLessonButton({ lessonId, initialCompleted, onChange }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !completed;
    setCompleted(next); // otimista
    onChange?.(next);
    startTransition(async () => {
      try {
        if (next) await markLessonCompleteAction(lessonId);
        else await unmarkLessonCompleteAction(lessonId);
      } catch {
        setCompleted(!next); // rollback em caso de erro
        onChange?.(!next);
      }
    });
  }

  return (
    <Button
      type="button"
      variant={completed ? 'secondary' : 'primary'}
      size="lg"
      onClick={toggle}
      disabled={pending}
    >
      {pending
        ? 'Salvando...'
        : completed
          ? '✓ Concluída — desmarcar'
          : 'Marcar como concluída'}
    </Button>
  );
}
