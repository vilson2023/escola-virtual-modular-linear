'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import type { ActionState } from '@/server/actions/courses';

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initialData?: { title: string; description: string | null };
  submitLabel: string;
};

export function CourseForm({ action, initialData, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialData?.title ?? ''}
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initialData?.description ?? ''}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Salvando...' : submitLabel}
        </Button>
        <Link
          href="/admin/courses"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
