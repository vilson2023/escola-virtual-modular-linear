import { signOut } from '@/lib/auth';
import { requireAuth } from '@/server/auth/session';

// A página usa auth() (dados de runtime), então não pode ser pré-renderizada estaticamente
export const instant = false;

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-md">
        <h1 className="text-2xl font-bold text-slate-900">Olá, {user.name}</h1>
        <p className="mt-2 text-sm text-slate-500">{user.email}</p>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
          className="mt-6"
        >
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Sair
          </button>
        </form>
      </div>
    </main>
  );
}
