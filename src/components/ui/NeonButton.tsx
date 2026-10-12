'use client';

import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'accent' | 'ghost' | 'glass';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow-brand hover:scale-[1.02] hover:brightness-110',
  accent:
    'bg-gradient-to-r from-accent-500 to-accent-400 text-night-950 font-bold shadow-glow-accent hover:scale-[1.02] hover:brightness-110',
  ghost: 'border border-brand-500/40 text-white/90 hover:bg-brand-500/10 hover:text-white',
  glass: 'glass glass-hover text-white hover:scale-[1.02]',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-lg',
};

export function NeonButton({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  ...rest
}: Props) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50 disabled:hover:scale-100 ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
