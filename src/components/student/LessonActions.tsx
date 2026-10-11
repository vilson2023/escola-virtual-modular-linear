'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MarkLessonButton } from '@/components/student/MarkLessonButton';

type Props = {
  lessonId: string;
  initialCompleted: boolean;
  nextLessonHref?: string;
};

/**
 * Agrupa o botão de marcar/desmarcar com a navegação "Próxima aula".
 * Quando a aula é marcada como concluída, o botão de próxima aula
 * ganha destaque (primary) para incentivar o avanço linear.
 */
export function LessonActions({ lessonId, initialCompleted, nextLessonHref }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <MarkLessonButton
        lessonId={lessonId}
        initialCompleted={initialCompleted}
        onChange={setCompleted}
      />
      {nextLessonHref && (
        <Button href={nextLessonHref} variant={completed ? 'primary' : 'secondary'} size="lg">
          Próxima aula →
        </Button>
      )}
    </div>
  );
}
