'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { RatingStars } from '@/components/shared/rating-stars';
import { CuitVerification } from '@/components/shared/cuit-verification';
import { getInitials, formatDate } from '@/utils/format';
import { createClient } from '@/lib/supabase/client';
import type { TProfileTransportista } from '@/types/database';
import Link from 'next/link';

export function PerfilTransportistaClient() {
  const [profile, setProfile] = useState<TProfileTransportista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('No se pudo obtener tu sesion');
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles_transportista')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError || !data) {
        setError('No se encontro tu perfil');
        return;
      }

      setProfile(data as TProfileTransportista);
    } catch {
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleCuitVerified = useCallback(
    (cuit: string) => {
      if (profile) {
        setProfile({ ...profile, cuit, verified: true });
      }
    },
    [profile]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Card>
        <p className="text-center text-red-600">
          {error ?? 'Error desconocido'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy text-xl font-bold text-white">
            {getInitials(`${profile.nombre} ${profile.apellido}`)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-navy">
                {profile.nombre} {profile.apellido}
              </h2>
              {profile.verified && (
                <Badge variant="green">Verificado</Badge>
              )}
            </div>
            <div className="mt-1">
              <RatingStars
                rating={profile.rating}
                total={profile.total_viajes}
                size="sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Miembro desde {formatDate(profile.created_at)}
            </p>
          </div>
        </div>
      </Card>

      {/* CUIT verification */}
      <Card>
        <h3 className="mb-3 text-base font-bold text-navy">
          Verificacion CUIT
        </h3>
        <CuitVerification
          currentCuit={profile.cuit}
          verified={profile.verified}
          onVerified={handleCuitVerified}
        />
      </Card>

      {/* Plan */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-navy">Mi plan</h3>
            <p className="mt-1 text-sm text-gray-600">
              Plan actual:{' '}
              <span className="font-semibold capitalize text-gold">
                {profile.plan}
              </span>
            </p>
          </div>
          <Link href="/t-perfil/planes">
            <Button variant="outline" size="sm">
              Ver planes
            </Button>
          </Link>
        </div>
      </Card>

      {/* Trucks section */}
      <Card>
        <h3 className="mb-3 text-base font-bold text-navy">Mis camiones</h3>
        <p className="text-sm text-gray-500">
          Proximamente vas a poder gestionar tu flota desde aca.
        </p>
        <p className="mt-2 text-xs font-medium text-gold">
          Proximamente
        </p>
      </Card>
    </div>
  );
}
