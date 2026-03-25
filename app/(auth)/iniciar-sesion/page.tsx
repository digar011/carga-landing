'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Email o contraseña incorrectos. Intentá de nuevo.');
      setLoading(false);
      return;
    }

    router.push('/t-panel');
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8">
      <h1 className="mb-2 text-2xl font-extrabold text-navy">Bienvenido</h1>
      <p className="mb-6 text-sm text-gray-500">
        Ingresá a tu cuenta para continuar
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿No tenés cuenta?{' '}
        <Link href="/registro" className="font-semibold text-brand-blue hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}
