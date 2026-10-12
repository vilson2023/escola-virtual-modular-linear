'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/courses', label: 'Cursos' },
  { href: '/admin/dev-tools', label: 'Dev Tools' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação do admin"
      className="flex items-center gap-4 overflow-x-auto text-sm"
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/admin' ? pathname === '/admin' : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`shrink-0 pb-1 whitespace-nowrap ${
              isActive
                ? 'border-brand-600 text-brand-600 border-b-2 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
