import Link from 'next/link';
import { signOut } from '@/lib/auth';
import { requireAuth } from '@/server/auth/session';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user.name}</span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </Container>
      </header>

      <Container className="py-12">
        <h1 className="text-3xl font-bold text-slate-900">Olá, {user.name} 👋</h1>
        <p className="mt-2 text-slate-500">Pronto para continuar de onde parou?</p>

        <div className="mt-8 space-y-6">
          {user.role === 'ADMIN' && (
            <Card className="border-brand-200 bg-brand-50">
              <h2 className="text-lg font-semibold text-slate-900">Você é administrador</h2>
              <p className="mt-1 text-sm text-slate-600">
                Gerencie cursos, módulos e alunos no painel administrativo.
              </p>
              <div className="mt-4">
                <Button href="/admin" variant="primary" size="sm">
                  Ir para o Painel Admin →
                </Button>
              </div>
            </Card>
          )}

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Meus cursos</h2>
            <p className="mt-2 text-sm text-slate-500">
              Você ainda não começou nenhum curso. Explore a vitrine em breve.
            </p>
          </Card>
        </div>
      </Container>
    </div>
  );
}
