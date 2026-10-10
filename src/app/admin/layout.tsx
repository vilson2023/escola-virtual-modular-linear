import Link from 'next/link';
import { requireRole } from '@/server/auth/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('ADMIN');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-bold text-gray-900">Painel Admin</h1>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/admin/courses" className="text-gray-600 hover:text-gray-900">
              Cursos
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
            >
              Voltar ao site
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
