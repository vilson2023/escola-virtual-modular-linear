import Link from 'next/link';
import type { BundleInfo } from '@/server/services/bundle';
import { SimulateBundleButton } from '@/components/student/SimulateBundleButton';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type Props = {
  courseId: string;
  info: BundleInfo;
  moduleCount: number;
};

/**
 * Card "Formação completa" — oferta do pacote com todos os módulos (M12c).
 * - Disponível: preço riscado + desconto + botão para o checkout do bundle.
 * - Indisponível (aluno já tem algum módulo PAID): mensagem orientando a
 *   continuar comprando individualmente, sem botão de bundle.
 */
export function BundleCard({ courseId, info, moduleCount }: Props) {
  if (!info.available) {
    const n = info.alreadyOwnedModuleIds.length;
    return (
      <div className="shadow-card rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-sm font-bold text-slate-700">💎 Formação completa</h3>
        <p className="mt-2 text-sm text-slate-500">
          Você já tem {n} módulo{n === 1 ? '' : 's'} deste curso. Continue comprando
          individualmente.
        </p>
      </div>
    );
  }

  const totalFormatted = brl.format(info.modulesTotalCents / 100);
  const bundleFormatted = brl.format(info.bundleApplicableCents / 100);

  return (
    <div className="shadow-card relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
      <h3 className="text-base font-bold text-slate-900">
        💎 Prefere adquirir a formação completa?
      </h3>
      <p className="mt-1 text-sm text-slate-600">Todos os {moduleCount} módulos de uma vez.</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-400 line-through">{totalFormatted}</span>
        <span className="text-2xl font-bold text-slate-900">{bundleFormatted}</span>
        <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-amber-900">
          + {info.discountPercent}% de economia
        </span>
      </div>

      <Link
        href={`/courses/${courseId}/checkout/bundle`}
        className="bg-brand-600 hover:bg-brand-700 mt-4 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
      >
        Comprar formação completa
      </Link>

      <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
        <li className="flex items-center gap-2">
          <span className="text-emerald-600">✓</span> {moduleCount} módulos
        </li>
        <li className="flex items-center gap-2">
          <span className="text-emerald-600">✓</span> Acesso vitalício
        </li>
        <li className="flex items-center gap-2">
          <span className="text-emerald-600">✓</span> Certificado de conclusão
        </li>
      </ul>

      {/* Ferramenta de desenvolvimento: simula o bundle sem gateway */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-3 border-t border-amber-100 pt-3">
          <SimulateBundleButton courseId={courseId} />
        </div>
      )}
    </div>
  );
}
