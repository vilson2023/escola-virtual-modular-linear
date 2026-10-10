export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-6 py-12">
      <p className="mb-8 text-sm font-semibold uppercase tracking-widest text-slate-500">
        Escola Virtual Modular Linear
      </p>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">{children}</div>
      <p className="mt-8 text-xs text-slate-400">© Escola Virtual Modular Linear</p>
    </main>
  );
}
