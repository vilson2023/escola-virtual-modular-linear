import Link from 'next/link';
import { signOut } from '@/lib/auth';
import { requireRole } from '@/server/auth/session';
import { Logo } from '@/components/ui/Logo';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('ADMIN');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo href="/admin" size="sm" />
            <Badge variant="brand">Admin</Badge>
          </div>
          <div className="flex items-center gap-6">
            <AdminNav />
            <div className="flex items-center gap-3 text-sm">
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                Voltar ao site
              </Link>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </Container>
      </header>
      <Container className="py-8">{children}</Container>
    </div>
  );
}
