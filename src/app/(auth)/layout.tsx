import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-night-gradient relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12">
      <div className="grid-bg absolute inset-0" aria-hidden />
      <div className="relative w-full">
        <div className="mb-8 flex justify-center">
          <Logo href="/" variant="light" size="lg" />
        </div>
        {children}
      </div>
    </main>
  );
}
