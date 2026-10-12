import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const metadata = { title: 'Painel Admin' };

export default async function AdminPage() {
  const [userCount, courseCount, moduleCount, lessonCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.module.count(),
    prisma.lesson.count(),
  ]);

  const stats = [
    { icon: '👥', label: 'Usuários', value: userCount },
    { icon: '📚', label: 'Cursos', value: courseCount },
    { icon: '📦', label: 'Módulos', value: moduleCount },
    { icon: '🎬', label: 'Aulas', value: lessonCount },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Visão geral</h2>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <div className="text-2xl">{stat.icon}</div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/admin/courses" variant="primary">
          Gerenciar Cursos →
        </Button>
        {process.env.NODE_ENV !== 'production' && (
          <Button href="/admin/payment-test" variant="secondary">
            Testar Asaas (dev)
          </Button>
        )}
      </div>
    </div>
  );
}
