'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import type { LessonActionState } from '@/server/actions/lessons';

type ContentType = 'VIDEO' | 'TEXT' | 'FILE';

const contentTypeLabels: Record<ContentType, string> = {
  VIDEO: 'Vídeo',
  TEXT: 'Texto',
  FILE: 'Arquivo',
};

const fieldClassName =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500';

type Props = {
  action: (prev: LessonActionState, formData: FormData) => Promise<LessonActionState>;
  initialData?: {
    title?: string;
    contentType?: ContentType;
    orderIndex?: number;
    videoUrl?: string | null;
    textContent?: string | null;
    fileUrl?: string | null;
  };
  submitLabel: string;
  cancelHref: string;
};

export function LessonForm({ action, initialData, submitLabel, cancelHref }: Props) {
  const [contentType, setContentType] = useState<ContentType>(initialData?.contentType ?? 'VIDEO');
  const [state, formAction, pending] = useActionState<LessonActionState, FormData>(action, null);

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
        <Label htmlFor="contentType">Tipo de conteúdo</Label>
        <select
          id="contentType"
          name="contentType"
          value={contentType}
          onChange={(e) => setContentType(e.target.value as ContentType)}
          className={fieldClassName}
        >
          {(Object.keys(contentTypeLabels) as ContentType[]).map((type) => (
            <option key={type} value={type}>
              {contentTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      {contentType === 'VIDEO' && (
        <div>
          <Label htmlFor="videoUrl">URL do vídeo</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            type="text"
            placeholder="https://..."
            defaultValue={initialData?.videoUrl ?? ''}
          />
          <p className="mt-1 text-xs text-slate-500">YouTube embed URL ou link direto</p>
        </div>
      )}

      {contentType === 'TEXT' && (
        <div>
          <Label htmlFor="textContent">Conteúdo do texto</Label>
          <textarea
            id="textContent"
            name="textContent"
            rows={10}
            defaultValue={initialData?.textContent ?? ''}
            className={fieldClassName}
          />
        </div>
      )}

      {contentType === 'FILE' && (
        <div>
          <Label htmlFor="fileUrl">URL do arquivo</Label>
          <Input
            id="fileUrl"
            name="fileUrl"
            type="text"
            placeholder="https://..."
            defaultValue={initialData?.fileUrl ?? ''}
          />
          <p className="mt-1 text-xs text-slate-500">
            Link direto para o arquivo (PDF, imagem, etc.)
          </p>
        </div>
      )}

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
