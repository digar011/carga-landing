'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useApplyToLoad } from '@/hooks/use-applications';

interface TApplyModalProps {
  open: boolean;
  onClose: () => void;
  loadId: string;
  routeLabel: string;
}

export function ApplyModal({ open, onClose, loadId, routeLabel }: TApplyModalProps) {
  const [mensaje, setMensaje] = useState('');
  const { apply, loading, error, success } = useApplyToLoad();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await apply(loadId, mensaje || undefined);
    if (result.success) {
      setTimeout(() => {
        onClose();
        setMensaje('');
      }, 2000);
    }
  }

  if (success) {
    return (
      <Modal open={open} onClose={onClose} title="Postulación enviada">
        <div className="py-4 text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h3 className="text-lg font-bold text-navy">
            ¡Te postulaste exitosamente!
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            El cargador va a revisar tu perfil y te va a notificar si acepta tu postulación.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Postularse a esta carga">
      <form onSubmit={handleSubmit}>
        <p className="mb-4 text-sm text-gray-600">
          Te estás postulando para la carga <strong>{routeLabel}</strong>.
          Podés agregar un mensaje opcional para el cargador.
        </p>

        <div className="mb-4">
          <Label htmlFor="mensaje" optional>
            Mensaje para el cargador
          </Label>
          <Textarea
            id="mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Ej: Tengo disponibilidad inmediata, cuento con semirremolque con lona..."
            rows={3}
            maxLength={500}
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {mensaje.length}/500
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Enviando...' : 'Confirmar postulación'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
