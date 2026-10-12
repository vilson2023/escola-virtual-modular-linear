import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'dumo — Sua jornada, módulo a módulo',
    template: '%s · dumo',
  },
  description: 'Plataforma de cursos em módulos lineares com pagamento por progresso.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'),
  openGraph: {
    title: 'dumo — Sua jornada, módulo a módulo',
    description: 'Plataforma de cursos em módulos lineares com pagamento por progresso.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dumo',
    description: 'Sua jornada, módulo a módulo.',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} font-sans`}>
      <body className="flex min-h-full flex-col bg-white text-slate-900">{children}</body>
    </html>
  );
}
