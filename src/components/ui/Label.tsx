import type { LabelHTMLAttributes } from 'react';

type Variant = 'light' | 'dark';

type Props = {
  variant?: Variant;
} & LabelHTMLAttributes<HTMLLabelElement>;

const variants: Record<Variant, string> = {
  light: 'text-slate-700',
  dark: 'text-white/70',
};

export function Label({ className = '', variant = 'light', ...rest }: Props) {
  return (
    <label
      className={`mb-1.5 block text-sm font-medium ${variants[variant]} ${className}`}
      {...rest}
    />
  );
}
