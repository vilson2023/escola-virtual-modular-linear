'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/courses', label: 'Cursos' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4 text-sm">
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              isActive
                ? 'border-b-2 border-brand-600 pb-1 font-semibold text-brand-600'
                : 'pb-1 text-slate-600 hover:text-slate-900'
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
