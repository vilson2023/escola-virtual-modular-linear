'use client';

import { useActionState } from 'react';
import Link from 'next/link';
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
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialData?.title ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initialData?.description ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? 'Salvando...' : submitLabel}
        </button>
        <Link
          href="/admin/courses"
          className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
