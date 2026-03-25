'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatRating, getInitials } from '@/utils/format';
import { TRUCK_TYPE_LABELS } from '@/utils/constants';
import { useManageApplication } from '@/hooks/use-applications';

interface TTruck {
  tipo: string;
  patente: string;
  capacidad_tn: number;
  marca: string;
  modelo: string;
}

interface TTransportista {
  id: string;
  nombre: string;
  apellido: string;
  cuit: string;
  rating: number;
  total_viajes: number;
  verified: boolean;
  avatar_url: string | null;
  ciudad: string;
  provincia: string;
  trucks: TTruck[];
}

interface TApplicationCardProps {
  application: {
    id: string;
    mensaje: string | null;
    estado: string;
    created_at: string;
    transportista: TTransportista;
  };
  onStatusChange?: () => void;
}

export function ApplicationCard({ application, onStatusChange }: TApplicationCardProps) {
  const { updateApplication, loading } = useManageApplication();
  const [status, setStatus] = useState(application.estado);
  const t = application.transportista;

  async function handleAction(newStatus: 'aceptada' | 'rechazada') {
    const result = await updateApplication(application.id, newStatus);
    if (result) {
      setStatus(newStatus);
      onStatusChange?.();
    }
  }

  const statusVariant = status === 'aceptada'
    ? 'green'
    : status === 'rechazada'
      ? 'red'
      : 'blue';

  const statusLabel = status === 'aceptada'
    ? 'Aceptada'
    : status === 'rechazada'
      ? 'Rechazada'
      : 'Pendiente';

  return (
    <Card padding="md" className="relative">
      <Badge variant={statusVariant} className="absolute right-4 top-4">
        {statusLabel}
      </Badge>

      {/* Transportista info */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
          {getInitials(`${t.nombre} ${t.apellido}`)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-bold text-navy">
            {t.nombre} {t.apellido}
          </h3>
          <p className="text-sm text-gray-500">
            {t.ciudad}, {t.provincia}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gold">⭐ {formatRating(t.rating, t.total_viajes)}</span>
            {t.verified && (
              <span className="text-brand-green">✅ CUIT verificado</span>
            )}
          </div>
        </div>
      </div>

      {/* Trucks */}
      {t.trucks.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-semibold text-gray-500">CAMIONES</p>
          {t.trucks.map((truck) => (
            <p key={truck.patente} className="text-sm text-gray-700">
              🚛 {truck.marca} {truck.modelo} · {TRUCK_TYPE_LABELS[truck.tipo] ?? truck.tipo} · {truck.capacidad_tn}tn · {truck.patente}
            </p>
          ))}
        </div>
      )}

      {/* Message */}
      {application.mensaje && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-semibold text-gray-500">MENSAJE</p>
          <p className="mt-1 text-sm text-gray-700">{application.mensaje}</p>
        </div>
      )}

      {/* Actions */}
      {status === 'pendiente' && (
        <div className="mt-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleAction('aceptada')}
            disabled={loading}
            className="flex-1"
          >
            ✅ Aceptar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('rechazada')}
            disabled={loading}
            className="flex-1"
          >
            Rechazar
          </Button>
        </div>
      )}
    </Card>
  );
}
