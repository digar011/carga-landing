'use client';

import { useState } from 'react';

interface TApplyResult {
  success: boolean;
  error?: string;
}

export function useApplyToLoad() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const apply = async (loadId: string, mensaje?: string): Promise<TApplyResult> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/loads/${loadId}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        return { success: true };
      }

      const errorMsg = result.error?.message ?? 'Error al postularte';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } catch {
      const errorMsg = 'Error de conexión. Intentá de nuevo.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return { apply, loading, error, success };
}

export function useManageApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateApplication = async (
    applicationId: string,
    estado: 'aceptada' | 'rechazada'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message ?? 'Error al actualizar la aplicación');
        return null;
      }

      return result.data;
    } catch {
      setError('Error de conexión');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateApplication, loading, error };
}
