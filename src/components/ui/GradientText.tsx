type Props = {
  children: React.ReactNode;
  className?: string;
  from?: 'brand' | 'accent';
};

export function GradientText({ children, className = '' }: Props) {
  return <span className={`text-gradient-brand ${className}`}>{children}</span>;
}
