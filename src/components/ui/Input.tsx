import type { InputHTMLAttributes } from 'react';

type Variant = 'light' | 'dark';

type Props = {
  variant?: Variant;
} & InputHTMLAttributes<HTMLInputElement>;

const variants: Record<Variant, string> = {
  light:
    'border-slate-300 text-slate-900 focus:border-transparent focus:ring-brand-500 placeholder:text-slate-400',
  dark: 'border-brand-500/30 bg-white/5 text-white placeholder:text-white/40 focus:border-brand-500 focus:ring-brand-500/50',
};

export function Input({ className = '', variant = 'light', ...rest }: Props) {
  return (
    <input
      className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:ring-2 focus:outline-none ${variants[variant]} ${className}`}
      {...rest}
    />
  );
}
