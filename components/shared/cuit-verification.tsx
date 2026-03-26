'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

interface TCuitVerificationProps {
  currentCuit: string | null;
  verified: boolean;
  onVerified: (cuit: string) => void;
}

/**
 * Auto-format CUIT as XX-XXXXXXXX-X while typing.
 * Inserts dashes after positions 2 and 10.
 */
function formatCuitInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

export function CuitVerification({
  currentCuit,
  verified,
  onVerified,
}: TCuitVerificationProps) {
  const [cuit, setCuit] = useState(currentCuit ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    razonSocial: string;
  } | null>(null);

  const handleCuitChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCuitInput(e.target.value);
      setCuit(formatted);
      setError(null);
      setSuccessData(null);
    },
    []
  );

  const handleVerify = useCallback(async () => {
    if (!cuit.trim()) {
      setError('Ingresa tu CUIT');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-cuit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuit: cuit.replace(/-/g, '') }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.error?.message ?? 'No se pudo verificar el CUIT'
        );
        return;
      }

      setSuccessData({ razonSocial: result.data.razonSocial });
      onVerified(cuit);
    } catch {
      setError('Error de conexion. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [cuit, onVerified]);

  // Already verified state
  if (verified && !successData) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="green">CUIT verificado</Badge>
        {currentCuit && (
          <span className="text-sm font-medium text-gray-700">
            {currentCuit}
          </span>
        )}
      </div>
    );
  }

  // Just verified state
  if (successData) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="green">CUIT verificado</Badge>
          <span className="text-sm font-medium text-gray-700">{cuit}</span>
        </div>
        <p className="text-sm text-brand-green">
          {successData.razonSocial}
        </p>
      </div>
    );
  }

  // Verification form
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="cuit">CUIT</Label>
        <Input
          id="cuit"
          value={cuit}
          onChange={handleCuitChange}
          placeholder="XX-XXXXXXXX-X"
          maxLength={13}
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}

      <Button
        onClick={handleVerify}
        disabled={loading || cuit.replace(/-/g, '').length !== 11}
        variant="secondary"
        size="sm"
      >
        {loading ? <Spinner size="sm" /> : 'Verificar CUIT'}
      </Button>
    </div>
  );
}
