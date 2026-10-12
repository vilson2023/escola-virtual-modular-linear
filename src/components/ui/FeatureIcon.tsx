type Props = {
  children: React.ReactNode;
  color?: 'brand' | 'accent';
};

export function FeatureIcon({ children, color = 'brand' }: Props) {
  return (
    <div
      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br text-2xl ${
        color === 'brand'
          ? 'border-brand-500/30 from-brand-500/20 to-accent-400/20 shadow-glow-brand'
          : 'border-accent-400/30 from-accent-400/20 to-brand-500/20 shadow-glow-accent'
      }`}
    >
      {children}
    </div>
  );
}
