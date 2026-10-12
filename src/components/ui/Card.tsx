import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: Props) {
  return (
    <div
      className={`shadow-card rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
