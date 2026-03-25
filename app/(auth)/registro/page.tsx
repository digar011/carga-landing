'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TUserRole } from '@/types/database';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400">Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get('role') as TUserRole | null;

  const [step, setStep] = useState<'role' | 'details'>(
    preselectedRole ? 'details' : 'role'
  );
  const [role, setRole] = useState<TUserRole>(preselectedRole ?? 'transportista');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function selectRole(selected: TUserRole) {
    setRole(selected);
    setStep('details');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          nombre,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/t-panel');
    router.refresh();
  }

  if (step === 'role') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="mb-2 text-2xl font-extrabold text-navy">Crear cuenta</h1>
        <p className="mb-8 text-sm text-gray-500">
          Seleccioná tu tipo de cuenta para comenzar
        </p>

        <div className="space-y-3">
          <button
            onClick={() => selectRole('transportista')}
            className="flex w-full items-center gap-4 rounded-xl border-2 border-gray-200 p-5 text-left transition-colors hover:border-gold hover:bg-gold/5"
          >
            <span className="text-3xl">🚛</span>
            <div>
              <div className="font-bold text-navy">Soy Transportista</div>
              <div className="text-sm text-gray-500">
                Busco cargas para transportar
              </div>
            </div>
          </button>

          <button
            onClick={() => selectRole('cargador')}
            className="flex w-full items-center gap-4 rounded-xl border-2 border-gray-200 p-5 text-left transition-colors hover:border-gold hover:bg-gold/5"
          >
            <span className="text-3xl">📦</span>
            <div>
              <div className="font-bold text-navy">Soy Cargador</div>
              <div className="text-sm text-gray-500">
                Necesito enviar mercadería
              </div>
            </div>
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tenés cuenta?{' '}
          <Link href="/iniciar-sesion" className="font-semibold text-brand-blue hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8">
      <div className="mb-6">
        <button
          onClick={() => setStep('role')}
          className="mb-4 text-sm font-medium text-gray-500 hover:text-navy"
        >
          ← Cambiar tipo de cuenta
        </button>
        <h1 className="mb-1 text-2xl font-extrabold text-navy">
          Registro como{' '}
          {role === 'transportista' ? 'Transportista' : 'Cargador'}
        </h1>
        <p className="text-sm text-gray-500">
          Completá tus datos para crear tu cuenta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nombre">
            {role === 'transportista' ? 'Nombre completo' : 'Nombre de empresa'}
          </Label>
          <Input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={
              role === 'transportista'
                ? 'Juan García'
                : 'Agro San Martín S.A.'
            }
            required
            autoComplete="name"
          />
        </div>

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
            placeholder="Mínimo 8 caracteres"
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tenés cuenta?{' '}
        <Link href="/iniciar-sesion" className="font-semibold text-brand-blue hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
