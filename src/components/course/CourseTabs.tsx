'use client';

import { useState } from 'react';

type Tab = 'sobre' | 'modulos';

type Props = {
  sobre: React.ReactNode;
  modulos: React.ReactNode;
  defaultTab?: Tab;
};

export function CourseTabs({ sobre, modulos, defaultTab = 'sobre' }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  const base = 'rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none';
  const active = 'bg-brand-600 text-white shadow-sm';
  const inactive = 'text-slate-600 hover:bg-slate-100';

  return (
    <div>
      <div className="inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setTab('sobre')}
          className={`${base} ${tab === 'sobre' ? active : inactive}`}
          aria-selected={tab === 'sobre'}
          role="tab"
        >
          Sobre o curso
        </button>
        <button
          type="button"
          onClick={() => setTab('modulos')}
          className={`${base} ${tab === 'modulos' ? active : inactive}`}
          aria-selected={tab === 'modulos'}
          role="tab"
        >
          Módulos
        </button>
      </div>

      <div className="mt-6">{tab === 'sobre' ? sobre : modulos}</div>
    </div>
  );
}
