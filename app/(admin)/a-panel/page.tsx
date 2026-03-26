'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { StatCard } from '@/components/admin/stat-card';

interface TStats {
  total_users: number;
  total_transportistas: number;
  total_cargadores: number;
  total_loads: number;
  active_loads: number;
  total_subscriptions: number;
  new_signups_30d: number;
}

interface TLogEntry {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  created_at: string;
  admin: { email: string } | { email: string }[] | null;
}

const ACTION_LABELS: Record<string, string> = {
  suspend: 'Suspendió',
  activate: 'Activó',
  change_role: 'Cambió rol de',
  cancel: 'Canceló',
  restore: 'Restauró',
  verify: 'Verificó',
  delete_rating: 'Eliminó calificación de',
};

const ENTITY_LABELS: Record<string, string> = {
  user: 'usuario',
  load: 'carga',
  rating: 'calificación',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminPanelPage() {
  const [stats, setStats] = useState<TStats | null>(null);
  const [logs, setLogs] = useState<TLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/logs?limit=5'),
      ]);

      if (!statsRes.ok || !logsRes.ok) {
        setError('Error al cargar los datos del panel');
        return;
      }

      const statsJson = await statsRes.json();
      const logsJson = await logsRes.json();

      if (statsJson.success) setStats(statsJson.data);
      if (logsJson.success) setLogs(logsJson.data ?? []);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-navy">Panel de Administraci&oacute;n</h1>
        <Card>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 text-sm font-medium text-navy underline hover:text-navy-dark"
          >
            Reintentar
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Panel de Administraci&oacute;n</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Usuarios"
          value={stats?.total_users ?? 0}
          icon="\uD83D\uDC65"
          color="navy"
        />
        <StatCard
          label="Transportistas"
          value={stats?.total_transportistas ?? 0}
          icon="\uD83D\uDE9A"
          color="blue"
        />
        <StatCard
          label="Cargadores"
          value={stats?.total_cargadores ?? 0}
          icon="\uD83C\uDFED"
          color="gold"
        />
        <StatCard
          label="Cargas Activas"
          value={stats?.active_loads ?? 0}
          icon="\uD83D\uDCE6"
          color="green"
        />
        <StatCard
          label="Suscripciones"
          value={stats?.total_subscriptions ?? 0}
          icon="\uD83D\uDCB3"
          color="gold"
        />
        <StatCard
          label="Nuevos (30d)"
          value={stats?.new_signups_30d ?? 0}
          icon="\uD83D\uDCC8"
          color="green"
        />
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-navy">Actividad reciente</h2>
        <Card padding="sm">
          {logs.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No hay actividad registrada a&uacute;n.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {logs.map((log) => {
                const adminRecord = Array.isArray(log.admin) ? log.admin[0] : log.admin;
                const adminEmail = adminRecord?.email ?? 'Admin';
                const actionLabel = ACTION_LABELS[log.action] ?? log.action;
                const entityLabel = ENTITY_LABELS[log.entity] ?? log.entity;

                return (
                  <li key={log.id} className="flex items-start gap-3 px-3 py-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm">
                      {log.action === 'cancel' ? '\u26D4' : '\u2699\uFE0F'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium text-navy">{adminEmail}</span>{' '}
                        {actionLabel} {entityLabel}{' '}
                        <span className="font-mono text-xs text-gray-400">
                          {log.entity_id.slice(0, 8)}...
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
