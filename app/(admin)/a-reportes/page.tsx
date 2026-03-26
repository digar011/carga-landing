'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface TSubscriptionSummary {
  plan: string;
  count: number;
}

interface TUnverifiedUser {
  id: string;
  email: string;
  role: string;
  nombre: string;
  cuit: string;
}

interface TFlaggedRating {
  id: string;
  score: number;
  comentario: string | null;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function ReportesPage() {
  const [loading, setLoading] = useState(true);
  const [subscriptionSummary, setSubscriptionSummary] = useState<TSubscriptionSummary[]>([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState<TUnverifiedUser[]>([]);
  const [flaggedRatings, setFlaggedRatings] = useState<TFlaggedRating[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch subscription stats
      const subsRes = await fetch('/api/admin/stats');
      if (subsRes.ok) {
        const subsJson = await subsRes.json();
        if (subsJson.success) {
          // Create summary from stats data
          setSubscriptionSummary([
            { plan: 'Total activas', count: subsJson.data.total_subscriptions },
          ]);
        }
      }

      // Fetch unverified users
      const usersRes = await fetch('/api/admin/users?verified=false&limit=10');
      if (usersRes.ok) {
        const usersJson = await usersRes.json();
        if (usersJson.success) {
          setUnverifiedUsers(usersJson.data ?? []);
        }
      }

      // Fetch low-score ratings (score < 3)
      const ratingsRes = await fetch('/api/ratings?min_score=1&max_score=2&limit=10');
      if (ratingsRes.ok) {
        const ratingsJson = await ratingsRes.json();
        if (ratingsJson.success) {
          setFlaggedRatings(ratingsJson.data ?? []);
        }
      }
    } catch {
      // Connection errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleExport(type: 'users' | 'loads' | 'subscriptions') {
    setExporting(type);
    try {
      const res = await fetch(`/api/admin/export?type=${type}`);
      if (!res.ok) {
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carga-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Download error
    } finally {
      setExporting(null);
    }
  }

  async function handleVerifyUser(userId: string) {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'activate' }),
      });
      const json = await res.json();
      if (json.success) {
        setUnverifiedUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {
      // Silent fail
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteRating(ratingId: string) {
    setActionLoading(ratingId);
    try {
      // Log the admin action — actual deletion would need a dedicated endpoint
      // For now we just remove it from the UI
      setFlaggedRatings((prev) => prev.filter((r) => r.id !== ratingId));
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-navy">Reportes y Moderaci&oacute;n</h1>

      {/* Subscription overview */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy">Suscripciones</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptionSummary.map((sub) => (
            <Card key={sub.plan} padding="sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize text-gray-600">
                  {sub.plan}
                </span>
                <span className="text-2xl font-bold text-navy">{sub.count}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CUIT verification queue */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy">
          Cola de verificaci&oacute;n de CUIT
        </h2>
        <Card padding="sm">
          {unverifiedUsers.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No hay usuarios pendientes de verificaci&oacute;n.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {unverifiedUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-3 px-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800">{user.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {user.email} &middot; CUIT: {user.cuit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === 'transportista' ? 'blue' : 'gold'}>
                      {user.role === 'transportista' ? 'Transp.' : 'Cargador'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleVerifyUser(user.id)}
                      disabled={actionLoading === user.id}
                    >
                      {actionLoading === user.id ? 'Verificando...' : 'Verificar'}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* Ratings moderation */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy">
          Moderaci&oacute;n de calificaciones
        </h2>
        <Card padding="sm">
          {flaggedRatings.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No hay calificaciones marcadas para revisi&oacute;n.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {flaggedRatings.map((rating) => (
                <li
                  key={rating.id}
                  className="flex items-center justify-between gap-3 px-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="red">{rating.score} / 5</Badge>
                      <span className="text-xs text-gray-400">
                        {formatDate(rating.created_at)}
                      </span>
                    </div>
                    {rating.comentario && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {rating.comentario}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteRating(rating.id)}
                    disabled={actionLoading === rating.id}
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* CSV exports */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy">Exportar datos</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleExport('users')}
            disabled={exporting !== null}
          >
            {exporting === 'users' ? 'Exportando...' : 'Exportar usuarios'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('loads')}
            disabled={exporting !== null}
          >
            {exporting === 'loads' ? 'Exportando...' : 'Exportar cargas'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('subscriptions')}
            disabled={exporting !== null}
          >
            {exporting === 'subscriptions'
              ? 'Exportando...'
              : 'Exportar suscripciones'}
          </Button>
        </div>
      </section>
    </div>
  );
}
