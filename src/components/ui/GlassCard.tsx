type Props = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export function GlassCard({ children, className = '', hover = true }: Props) {
  return (
    <div className={`glass rounded-2xl p-6 ${hover ? 'glass-hover' : ''} ${className}`}>
      {children}
    </div>
  );
}
