import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Escola Virtual Modular Linear
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Uma plataforma de cursos em módulos lineares: avance aula a aula, compre o próximo
          módulo quando estiver pronto e conquiste seu certificado.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </main>
  );
}
