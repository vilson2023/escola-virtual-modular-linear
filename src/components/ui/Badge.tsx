type Variant = 'success' | 'warning' | 'danger' | 'neutral' | 'brand';

type Props = {
  variant?: Variant;
  children: React.ReactNode;
};

const variants: Record<Variant, string> = {
  success: 'bg-green-50 text-green-700 ring-green-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
};

export function Badge({ variant = 'neutral', children }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
