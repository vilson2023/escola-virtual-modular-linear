import type { InputHTMLAttributes } from 'react';

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 ${className}`}
      {...rest}
    />
  );
}
