import Link from 'next/link';
import type { ModuleWithState } from '@/server/services/module-state';

type Props = {
  courseId: string;
  modules: ModuleWithState[];
  isLoggedIn: boolean;
  hasCertificate: boolean;
};

export function ProgressCard({ courseId, modules, isLoggedIn, hasCertificate }: Props) {
  if (!isLoggedIn) {
    return (
      <div className="shadow-card rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900">Seu progresso neste curso</h3>
        <p className="mt-2 text-sm text-slate-500">Entre para acompanhar seu progresso.</p>
        <Link
          href="/login"
          className="bg-brand-600 hover:bg-brand-700 mt-4 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
        >
          Entrar
        </Link>
      </div>
    );
  }

  const total = modules.length;
  const purchased = modules.filter((m) => m.isPurchased).length;
  const concluded = modules.filter((m) => m.isPurchased && m.progressPercent === 100).length;
  const totalLessons = modules.reduce((acc, m) => acc + m.lessonCount, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.completedCount, 0);
  const overallPercent =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  const allConcluded = total > 0 && concluded === total;

  // ---------- Recomendação inteligente do próximo passo (M12c) ----------
  // Ordem de prioridade: em andamento → adquirido sem progresso → próximo
  // disponível (todos os adquiridos concluídos) → nada adquirido → 100%.
  const indexOf = (m: ModuleWithState) => modules.indexOf(m) + 1;

  const inProgress = modules.find(
    (m) => m.isPurchased && m.progressPercent > 0 && m.progressPercent < 100,
  );
  const acquiredNoProgress = modules.find((m) => m.isPurchased && m.progressPercent === 0);
  const nextAvailable = modules.find((m) => !m.isPurchased);

  type Recommendation = {
    title: string;
    buttonLabel: string;
    href: string;
  } | null;

  let recommendation: Recommendation = null;
  if (inProgress) {
    recommendation = {
      title: `Continue o Módulo ${indexOf(inProgress)}: ${inProgress.title}`,
      buttonLabel: 'Continuar aprendendo',
      href: `/courses/${courseId}/modules/${inProgress.id}`,
    };
  } else if (acquiredNoProgress) {
    recommendation = {
      title: `Comece o Módulo ${indexOf(acquiredNoProgress)}: ${acquiredNoProgress.title}`,
      buttonLabel: 'Começar agora',
      href: `/courses/${courseId}/modules/${acquiredNoProgress.id}`,
    };
  } else if (purchased > 0 && nextAvailable) {
    // Todos os adquiridos concluídos e o próximo está disponível.
    // Tom convidativo: opção, não pressão.
    recommendation = {
      title: `Quando estiver pronto, o próximo passo é o Módulo ${indexOf(nextAvailable)}: ${nextAvailable.title}`,
      buttonLabel: 'Conhecer este módulo',
      href: `/courses/${courseId}/modules/${nextAvailable.id}`,
    };
  } else if (purchased === 0 && nextAvailable) {
    recommendation = {
      title: `Comece pelo Módulo ${indexOf(nextAvailable)}: ${nextAvailable.title}`,
      buttonLabel: 'Começar agora',
      href: `/courses/${courseId}/checkout/${nextAvailable.id}`,
    };
  }

  return (
    <div className="shadow-card rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-bold text-slate-900">Seu progresso neste curso</h3>

      <p className="mt-3 text-sm text-slate-600">
        Você adquiriu <span className="font-bold text-slate-900">{purchased}</span> de{' '}
        <span className="font-bold text-slate-900">{total}</span> módulos
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Você concluiu <span className="font-bold text-slate-900">{concluded}</span> módulos
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Progresso geral</span>
          <span className="font-semibold">{overallPercent}%</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="bg-brand-600 h-full rounded-full"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {allConcluded ? (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-emerald-700">🎉 Você concluiu tudo!</p>
          {hasCertificate && (
            <Link
              href={`/courses/${courseId}/certificate`}
              className="bg-brand-600 hover:bg-brand-700 mt-3 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
            >
              🏆 Ver certificado
            </Link>
          )}
        </div>
      ) : (
        recommendation && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Próximo passo recomendado
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{recommendation.title}</p>
            <Link
              href={recommendation.href}
              className="bg-brand-600 hover:bg-brand-700 mt-3 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
            >
              {recommendation.buttonLabel}
            </Link>
          </div>
        )
      )}
    </div>
  );
}
