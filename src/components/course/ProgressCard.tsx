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

  // Próximo módulo a continuar: primeiro adquirido e não concluído
  const nextModule = modules.find((m) => m.isPurchased && m.progressPercent < 100);
  const allConcluded = total > 0 && concluded === total;

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

      {nextModule && (
        <Link
          href={`/courses/${courseId}/modules/${nextModule.id}`}
          className="bg-brand-600 hover:bg-brand-700 mt-4 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
        >
          Continuar de onde parei
        </Link>
      )}

      {allConcluded && hasCertificate && (
        <Link
          href={`/courses/${courseId}/certificate`}
          className="bg-brand-600 hover:bg-brand-700 mt-4 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
        >
          🏆 Ver certificado
        </Link>
      )}
    </div>
  );
}
