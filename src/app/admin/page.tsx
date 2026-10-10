import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
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
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Visão geral</h2>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/admin/courses"
          className="inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Gerenciar Cursos →
        </Link>
      </div>
    </div>
  );
}
