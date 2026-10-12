import Link from 'next/link';
import type { ModuleWithState } from '@/server/services/module-state';
import { getDisplayState, type DisplayState } from '@/lib/module-display';
import { SimulatePurchaseButton } from '@/components/student/SimulatePurchaseButton';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const badgeStyles: Record<DisplayState, string> = {
  DISPONIVEL: 'bg-green-100 text-green-700',
  ADQUIRIDO: 'bg-blue-100 text-blue-700',
  EM_ANDAMENTO: 'bg-violet-100 text-violet-700',
  CONCLUIDO: 'bg-emerald-100 text-emerald-700',
  BLOQUEADO: 'bg-slate-100 text-slate-500',
};

const badgeLabels: Record<DisplayState, string> = {
  DISPONIVEL: 'Disponível para compra',
  ADQUIRIDO: 'Módulo adquirido',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: '✓ Concluído',
  BLOQUEADO: 'Bloqueado',
};

type Props = {
  module: ModuleWithState;
  index: number;
  courseId: string;
};

export function ModuleCard({ module, index, courseId }: Props) {
  const display = getDisplayState(module);
  const price = brl.format(module.priceCents / 100);
  const modulePath = `/courses/${courseId}/modules/${module.id}`;

  return (
    <div className="shadow-card relative rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      {/* Badge de estado */}
      <span
        className={`absolute top-4 right-4 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyles[display]}`}
      >
        {display === 'EM_ANDAMENTO'
          ? `${badgeLabels[display]} · ${module.progressPercent}%`
          : badgeLabels[display]}
      </span>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        {/* Thumbnail placeholder */}
        <div className="from-brand-600 to-brand-400 flex h-20 w-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl font-bold text-white sm:h-[90px] sm:w-[120px]">
          {String(index).padStart(2, '0')}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="pr-28 text-base font-bold text-slate-900 sm:pr-32">{module.title}</h3>

          {/* Barra de progresso (Em andamento / Concluído) */}
          {(display === 'EM_ANDAMENTO' || display === 'CONCLUIDO') && (
            <div className="mt-2 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-slate-200">
              <div
                className="bg-brand-600 h-full rounded-full"
                style={{ width: `${module.progressPercent}%` }}
              />
            </div>
          )}

          {module.description && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{module.description}</p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            {module.estimatedDurationMinutes != null && (
              <span>⏱️ {module.estimatedDurationMinutes} min · </span>
            )}
            📹 {module.lessonCount} aula{module.lessonCount === 1 ? '' : 's'}
          </p>

          {/* Preço: só em "Disponível" (sempre visível no mobile) */}
          {display === 'DISPONIVEL' && (
            <p className="mt-2 text-lg font-bold text-slate-900 sm:hidden">{price}</p>
          )}
        </div>

        {/* Preço + botão */}
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {display === 'DISPONIVEL' && (
            <p className="hidden text-lg font-bold whitespace-nowrap text-slate-900 sm:block">
              {price}
            </p>
          )}

          {display === 'DISPONIVEL' && (
            <Link
              href={`/courses/${courseId}/checkout/${module.id}`}
              className="bg-brand-600 hover:bg-brand-700 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-all hover:shadow-md"
            >
              Comprar este módulo — {price}
            </Link>
          )}
          {display === 'ADQUIRIDO' && (
            <Link
              href={modulePath}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold whitespace-nowrap text-slate-700 transition hover:bg-slate-50"
            >
              Acessar módulo
            </Link>
          )}
          {display === 'EM_ANDAMENTO' && (
            <Link
              href={modulePath}
              className="bg-brand-600 hover:bg-brand-700 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-all hover:shadow-md"
            >
              Continuar aprendendo
            </Link>
          )}
          {display === 'CONCLUIDO' && (
            <Link
              href={modulePath}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap text-slate-600 transition hover:bg-slate-100"
            >
              Rever conteúdo
            </Link>
          )}
          {display === 'BLOQUEADO' && (
            <button
              type="button"
              disabled
              title="Conclua o módulo anterior para desbloquear"
              className="inline-flex cursor-not-allowed items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap text-slate-400"
            >
              🔒 Ver detalhes
            </button>
          )}

          {/* Ferramenta de desenvolvimento: simula compra sem gateway */}
          {display === 'DISPONIVEL' && process.env.NODE_ENV !== 'production' && (
            <div className="mt-1">
              <SimulatePurchaseButton moduleId={module.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
