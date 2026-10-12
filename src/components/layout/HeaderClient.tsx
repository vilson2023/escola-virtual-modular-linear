'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';

type Props = {
  isLoggedIn: boolean;
};

const CATEGORIES = ['Marketing Digital'];

export function HeaderClient({ isLoggedIn }: Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/courses?q=${encodeURIComponent(q)}` : '/courses');
    setMobileOpen(false);
    setSearchOpen(false);
  }

  const navLink =
    'rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-cyan-300';

  return (
    <header className="sticky top-0 z-50 bg-[#0B3D4F] text-white shadow-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo variant="light" size="sm" />
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/" className={navLink}>
            Início
          </Link>
          <Link href="/courses" className={navLink}>
            Cursos
          </Link>
          <div className="relative">
            <button
              type="button"
              className={navLink}
              onClick={() => setCategoriesOpen((v) => !v)}
              aria-expanded={categoriesOpen}
              aria-haspopup="menu"
            >
              Categorias ▾
            </button>
            {categoriesOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0B3D4F] py-1 shadow-xl">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c}
                    href={`/courses?categoria=${encodeURIComponent(c)}`}
                    className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-cyan-300"
                    onClick={() => setCategoriesOpen(false)}
                  >
                    {c}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/sobre" className={navLink}>
            Sobre o dumo
          </Link>
        </nav>

        {/* Ações direita */}
        <div className="flex items-center gap-2">
          {/* Busca */}
          <form onSubmit={submitSearch} className="hidden items-center md:flex">
            {searchOpen ? (
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => !query && setSearchOpen(false)}
                placeholder="Buscar cursos..."
                className="w-44 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none"
                aria-label="Buscar cursos"
              />
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Abrir busca"
                className="rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-cyan-300"
              >
                🔍
              </button>
            )}
          </form>

          <Link
            href={isLoggedIn ? '/dashboard' : '/login'}
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-cyan-300 md:block"
          >
            Área do aluno
          </Link>

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Meu painel
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-cyan-300 sm:block"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Cadastrar
              </Link>
            </>
          )}

          {/* Hambúrguer mobile */}
          <button
            type="button"
            className="rounded-md p-2 text-white/90 transition hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0B3D4F] lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            <form onSubmit={submitSearch} className="mb-2 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cursos..."
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none"
                aria-label="Buscar cursos"
              />
              <button
                type="submit"
                className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                🔍
              </button>
            </form>
            {[
              ['Início', '/'],
              ['Cursos', '/courses'],
              ['Sobre o dumo', '/sobre'],
              ['Área do aluno', isLoggedIn ? '/dashboard' : '/login'],
              ['Entrar', '/login'],
              ['Cadastrar', '/register'],
            ].map(([label, href]) => (
              <Link
                key={label + href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-cyan-300"
              >
                {label}
              </Link>
            ))}
            <p className="mt-2 px-3 text-xs font-semibold tracking-wider text-white/40 uppercase">
              Categorias
            </p>
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/courses?categoria=${encodeURIComponent(c)}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-cyan-300"
              >
                {c}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
