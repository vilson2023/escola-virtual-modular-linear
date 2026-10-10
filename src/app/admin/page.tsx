import Link from 'next/link';
import { requireRole } from '@/server/auth/session';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  await requireRole('ADMIN');

  const [userCount, courseCount, moduleCount, lessonCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.module.count(),
    prisma.lesson.count(),
  ]);

  const stats = [
    { label: 'Usuários', value: userCount },
    { label: 'Cursos', value: courseCount },
    { label: 'Módulos', value: moduleCount },
    { label: 'Aulas', value: lessonCount },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900">Painel Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Visão geral da plataforma</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-6 text-center shadow-md">
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
