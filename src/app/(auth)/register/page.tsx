'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erro ao cadastrar');
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Conta criada, mas falha no login automático. Faça login manualmente.');
        router.push('/login');
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
    <Card className="w-full max-w-md">
      <div className="mb-6 text-center">
        <Logo href="/" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900">Comece sua jornada</h1>
      <p className="mt-1 text-sm text-slate-500">
        Crie sua conta gratuita e comece hoje.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            type="text"
            required
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            placeholder="Mínimo de 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Criar conta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem conta?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
