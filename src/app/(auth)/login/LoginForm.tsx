'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('E-mail ou senha inválidos');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard hover={false} className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
      <p className="mt-1 text-sm text-white/60">Entre para continuar sua jornada.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email" variant="dark">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            required
            variant="dark"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="password" variant="dark">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            required
            variant="dark"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <NeonButton type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </NeonButton>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Ainda não tem conta?{' '}
        <Link href="/register" className="text-gradient-brand font-semibold hover:brightness-125">
          Criar conta
        </Link>
      </p>
    </GlassCard>
  );
}
