import Link from 'next/link';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  href?: string;
};

const sizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export function Logo({ size = 'md', variant = 'dark', href }: Props) {
  const className = `font-bold tracking-tight ${
    variant === 'dark' ? 'text-slate-900' : 'text-white'
  } ${sizes[size]}`;

  if (href) {
    return (
      <Link href={href} className={`inline-block ${className}`}>
        dumo
      </Link>
    );
  }

  return <span className={className}>dumo</span>;
}
