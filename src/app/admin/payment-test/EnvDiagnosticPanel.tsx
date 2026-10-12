'use client';

import { useEffect, useState } from 'react';

type EnvMeta = {
  DATABASE_URL?: { present: boolean; length: number; startsWith: string };
  AUTH_SECRET?: { present: boolean; length: number };
  ASAAS_API_KEY?: {
    present: boolean;
    length: number;
    startsWith: string;
    hasBackslashAtStart: boolean;
    expectedPrefix: string;
    prefixMatches: boolean;
  };
  ASAAS_API_URL?: { present: boolean; value: string };
};

function Row({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <tr>
      <td className="px-3 py-2 font-medium text-slate-700">{label}</td>
      <td className={`px-3 py-2 font-semibold ${ok ? 'text-green-700' : 'text-red-700'}`}>
        {ok ? 'OK' : 'PROBLEMA'}
      </td>
      <td className="px-3 py-2 text-slate-600">{detail}</td>
    </tr>
  );
}

export function EnvDiagnosticPanel() {
  const [data, setData] = useState<EnvMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/debug/env')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro desconhecido'));
  }, []);

  const key = data?.ASAAS_API_KEY;
  const problems: string[] = [];
  if (key) {
    if (!key.present) problems.push('chave não carregada');
    if (key.hasBackslashAtStart) problems.push('barra invertida literal no início');
    if (!key.prefixMatches) problems.push('prefixo errado');
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-semibold text-slate-900">Diagnóstico de ambiente</h3>
      <p className="mt-1 text-xs text-slate-500">
        Metadados das variáveis de ambiente (valores sensíveis nunca são exibidos). [DEV]
      </p>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          ❌ Não foi possível consultar /api/debug/env: {error}
        </div>
      )}

      {!data && !error && <p className="mt-3 text-sm text-slate-500">Carregando...</p>}

      {data && (
        <>
          {problems.length > 0 && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              ❌ {problems.join(' · ')}
            </div>
          )}
          <table className="mt-3 w-full text-left text-sm">
            <tbody>
              <Row
                label="DATABASE_URL"
                ok={!!data.DATABASE_URL?.present}
                detail={`comprimento ${data.DATABASE_URL?.length ?? 0} · começa com "${data.DATABASE_URL?.startsWith ?? ''}"`}
              />
              <Row
                label="AUTH_SECRET"
                ok={!!data.AUTH_SECRET?.present}
                detail={`comprimento ${data.AUTH_SECRET?.length ?? 0}`}
              />
              <Row
                label="ASAAS_API_KEY"
                ok={key ? key.present && !key.hasBackslashAtStart && key.prefixMatches : false}
                detail={
                  key
                    ? `comprimento ${key.length} · começa com "${key.startsWith.slice(0, 9)}…" · barra invertida no início: ${key.hasBackslashAtStart ? 'sim (problema)' : 'não'} · prefixo bate: ${key.prefixMatches ? 'sim' : 'não'}`
                    : 'não retornado'
                }
              />
              <Row
                label="ASAAS_API_URL"
                ok={!!data.ASAAS_API_URL?.present}
                detail={data.ASAAS_API_URL?.value ?? 'não retornado'}
              />
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
