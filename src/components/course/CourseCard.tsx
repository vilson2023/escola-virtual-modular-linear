import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export type CourseCardData = {
  id: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  category: string | null;
  coverImageUrl: string | null;
  hasCertificate: boolean;
  moduleCount: number;
  minPriceCents: number | null;
};

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Card className="flex flex-col overflow-hidden p-0">
      {/* Capa */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
        {course.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.coverImageUrl}
            alt={course.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">📚</div>
        )}
        {course.category && (
          <span className="absolute top-3 left-3 rounded-md bg-blue-500/90 px-2 py-1 text-xs font-semibold text-white">
            {course.category}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {course.shortDescription ?? course.description ?? ''}
        </p>
        <p className="mt-3 text-xs font-medium text-slate-500">
          {course.moduleCount} módulo{course.moduleCount === 1 ? '' : 's'}
          {course.hasCertificate ? ' · Certificado' : ''}
        </p>

        <div className="mt-auto pt-4">
          {course.minPriceCents != null && (
            <p className="text-sm text-slate-600">
              Módulos a partir de{' '}
              <span className="text-base font-bold text-slate-900">
                {brl.format(course.minPriceCents / 100)}
              </span>
            </p>
          )}
          <Link
            href={`/courses/${course.id}`}
            className="bg-brand-600 hover:bg-brand-700 mt-3 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
          >
            Conhecer curso
          </Link>
        </div>
      </div>
    </Card>
  );
}
