'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import type { ModuleActionState } from '@/server/actions/modules';

type Props = {
  action: (prev: ModuleActionState, formData: FormData) => Promise<ModuleActionState>;
  initialData?: {
    title?: string;
    description?: string | null;
    orderIndex?: number;
    priceCents?: number;
    presentationVideoUrl?: string | null;
  };
  submitLabel: string;
  cancelHref: string;
};

export function ModuleForm({ action, initialData, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState<ModuleActionState, FormData>(action, null);

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
          className="focus:ring-brand-500 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-transparent focus:ring-2 focus:outline-none"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="orderIndex">Ordem</Label>
          <Input
            id="orderIndex"
            name="orderIndex"
            type="number"
            min={1}
            required
            defaultValue={initialData?.orderIndex ?? 1}
          />
        </div>

        <div>
          <Label htmlFor="priceCents">Preço em centavos</Label>
          <Input
            id="priceCents"
            name="priceCents"
            type="number"
            min={0}
            required
            defaultValue={initialData?.priceCents ?? 0}
          />
          <p className="mt-1 text-xs text-slate-500">Ex: 9700 = R$ 97,00</p>
        </div>
      </div>

      <div>
        <Label htmlFor="presentationVideoUrl">URL do vídeo de apresentação</Label>
        <Input
          id="presentationVideoUrl"
          name="presentationVideoUrl"
          type="text"
          placeholder="https://..."
          defaultValue={initialData?.presentationVideoUrl ?? ''}
        />
        <p className="mt-1 text-xs text-slate-500">YouTube embed URL ou link direto (opcional)</p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Salvando...' : submitLabel}
        </Button>
        <Link
          href={cancelHref}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
