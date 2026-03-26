'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface TRatingFormProps {
  loadId: string;
  toUserId: string;
  routeLabel: string;
  onComplete: () => void;
}

export function RatingForm({
  loadId,
  toUserId,
  routeLabel,
  onComplete,
}: TRatingFormProps) {
  const [score, setScore] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (score === 0) {
      setError('Seleccioná una calificación');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          load_id: loadId,
          to_user_id: toUserId,
          score,
          comentario: comentario.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.error?.message ?? 'Error al enviar la calificación'
        );
        return;
      }

      setSuccess(true);
      setTimeout(() => onComplete(), 1500);
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [score, comentario, loadId, toUserId, onComplete]);

  if (success) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg font-semibold text-brand-green">
          Gracias por tu calificacion!
        </p>
        <p className="mt-1 text-sm text-gray-500">{routeLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {routeLabel && (
        <p className="text-sm text-gray-500">{routeLabel}</p>
      )}

      {/* Star selector */}
      <div>
        <Label>Tu calificacion</Label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setScore(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className={`text-3xl transition-colors ${
                star <= (hoveredStar || score)
                  ? 'text-gold'
                  : 'text-gray-300 hover:text-gold-light'
              }`}
              aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
            >
              {star <= (hoveredStar || score) ? '\u2605' : '\u2606'}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <Label optional>Comentario</Label>
        <Textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Conta tu experiencia (opcional)"
          maxLength={500}
          rows={3}
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {comentario.length}/500
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={loading || score === 0}
        className="w-full"
        variant="secondary"
      >
        {loading ? <Spinner size="sm" /> : 'Enviar calificacion'}
      </Button>
    </div>
  );
}
