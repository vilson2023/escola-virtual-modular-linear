import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'dumo — Sua jornada, módulo a módulo',
  description: 'Plataforma de cursos em módulos lineares com pagamento por progresso.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} font-sans`}>
      <body className="flex min-h-full flex-col bg-white text-slate-900">{children}</body>
    </html>
  );
}
