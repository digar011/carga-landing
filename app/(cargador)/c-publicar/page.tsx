'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { loadSchema } from '@/utils/validations';
import { PROVINCIAS, CARGO_TYPE_LABELS, TRUCK_TYPE_LABELS } from '@/utils/constants';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';

interface TFormData {
  origen_ciudad: string;
  origen_provincia: string;
  destino_ciudad: string;
  destino_provincia: string;
  tipo_carga: string;
  descripcion_carga: string;
  peso_tn: string;
  tipo_camion_requerido: string;
  tarifa_ars: string;
  tarifa_negociable: boolean;
  fecha_carga: string;
  fecha_entrega: string;
  observaciones: string;
}

const INITIAL_FORM: TFormData = {
  origen_ciudad: '',
  origen_provincia: '',
  destino_ciudad: '',
  destino_provincia: '',
  tipo_carga: '',
  descripcion_carga: '',
  peso_tn: '',
  tipo_camion_requerido: '',
  tarifa_ars: '',
  tarifa_negociable: false,
  fecha_carga: '',
  fecha_entrega: '',
  observaciones: '',
};

type TFieldErrors = Partial<Record<keyof TFormData, string>>;

export default function PublicarCargaPage() {
  const router = useRouter();
  const [form, setForm] = useState<TFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<TFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function updateField(field: keyof TFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleInputChange(field: keyof TFormData) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      updateField(field, e.target.value);
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);

    // Build payload for validation
    const payload = {
      origen_ciudad: form.origen_ciudad,
      origen_provincia: form.origen_provincia,
      destino_ciudad: form.destino_ciudad,
      destino_provincia: form.destino_provincia,
      tipo_carga: form.tipo_carga,
      descripcion_carga: form.descripcion_carga,
      peso_tn: form.peso_tn ? Number(form.peso_tn) : 0,
      tipo_camion_requerido: form.tipo_camion_requerido,
      tarifa_ars: form.tarifa_ars ? Number(form.tarifa_ars) : 0,
      tarifa_negociable: form.tarifa_negociable,
      fecha_carga: form.fecha_carga,
      fecha_entrega: form.fecha_entrega || undefined,
      observaciones: form.observaciones || undefined,
    };

    const result = loadSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: TFieldErrors = {};
      for (const err of result.error.errors) {
        const fieldName = err.path[0] as keyof TFormData | undefined;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = err.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/loads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const body = (await res.json()) as {
        success: boolean;
        error?: { message: string };
      };

      if (!res.ok || !body.success) {
        setApiError(body.error?.message ?? 'Error al publicar la carga');
        setSubmitting(false);
        return;
      }

      setShowSuccess(true);
    } catch (_err: unknown) {
      setApiError('Error de conexión. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSuccessClose() {
    setShowSuccess(false);
    router.push('/c-mis-cargas');
  }

  const cargoTypes = Object.entries(CARGO_TYPE_LABELS);
  const truckTypes = Object.entries(TRUCK_TYPE_LABELS);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-navy">Publicar Carga</h1>

      <form onSubmit={handleSubmit} noValidate>
        <Card className="space-y-6">
          {/* Origen */}
          <fieldset>
            <legend className="mb-3 text-base font-bold text-navy">Origen</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="origen_ciudad" required>
                  Ciudad
                </Label>
                <Input
                  id="origen_ciudad"
                  placeholder="Ej: Rosario"
                  value={form.origen_ciudad}
                  onChange={handleInputChange('origen_ciudad')}
                  error={!!errors.origen_ciudad}
                />
                {errors.origen_ciudad && (
                  <p className="mt-1 text-xs text-red-500">{errors.origen_ciudad}</p>
                )}
              </div>
              <div>
                <Label htmlFor="origen_provincia" required>
                  Provincia
                </Label>
                <Select
                  id="origen_provincia"
                  value={form.origen_provincia}
                  onChange={handleInputChange('origen_provincia')}
                  error={!!errors.origen_provincia}
                >
                  <option value="">Seleccionar...</option>
                  {PROVINCIAS.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </Select>
                {errors.origen_provincia && (
                  <p className="mt-1 text-xs text-red-500">{errors.origen_provincia}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Destino */}
          <fieldset>
            <legend className="mb-3 text-base font-bold text-navy">Destino</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="destino_ciudad" required>
                  Ciudad
                </Label>
                <Input
                  id="destino_ciudad"
                  placeholder="Ej: Buenos Aires"
                  value={form.destino_ciudad}
                  onChange={handleInputChange('destino_ciudad')}
                  error={!!errors.destino_ciudad}
                />
                {errors.destino_ciudad && (
                  <p className="mt-1 text-xs text-red-500">{errors.destino_ciudad}</p>
                )}
              </div>
              <div>
                <Label htmlFor="destino_provincia" required>
                  Provincia
                </Label>
                <Select
                  id="destino_provincia"
                  value={form.destino_provincia}
                  onChange={handleInputChange('destino_provincia')}
                  error={!!errors.destino_provincia}
                >
                  <option value="">Seleccionar...</option>
                  {PROVINCIAS.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </Select>
                {errors.destino_provincia && (
                  <p className="mt-1 text-xs text-red-500">{errors.destino_provincia}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Cargo details */}
          <fieldset>
            <legend className="mb-3 text-base font-bold text-navy">
              Datos de la carga
            </legend>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="tipo_carga" required>
                    Tipo de carga
                  </Label>
                  <Select
                    id="tipo_carga"
                    value={form.tipo_carga}
                    onChange={handleInputChange('tipo_carga')}
                    error={!!errors.tipo_carga}
                  >
                    <option value="">Seleccionar...</option>
                    {cargoTypes.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Select>
                  {errors.tipo_carga && (
                    <p className="mt-1 text-xs text-red-500">{errors.tipo_carga}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="peso_tn" required>
                    Peso (tn)
                  </Label>
                  <div className="relative">
                    <Input
                      id="peso_tn"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Ej: 28"
                      value={form.peso_tn}
                      onChange={handleInputChange('peso_tn')}
                      error={!!errors.peso_tn}
                      className="pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      tn
                    </span>
                  </div>
                  {errors.peso_tn && (
                    <p className="mt-1 text-xs text-red-500">{errors.peso_tn}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion_carga" required>
                  Descripción de la carga
                </Label>
                <Textarea
                  id="descripcion_carga"
                  rows={3}
                  placeholder="Describí qué tipo de mercadería vas a enviar..."
                  value={form.descripcion_carga}
                  onChange={handleInputChange('descripcion_carga')}
                  error={!!errors.descripcion_carga}
                />
                {errors.descripcion_carga && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.descripcion_carga}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="tipo_camion_requerido" required>
                  Tipo de camión requerido
                </Label>
                <Select
                  id="tipo_camion_requerido"
                  value={form.tipo_camion_requerido}
                  onChange={handleInputChange('tipo_camion_requerido')}
                  error={!!errors.tipo_camion_requerido}
                >
                  <option value="">Seleccionar...</option>
                  {truckTypes.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
                {errors.tipo_camion_requerido && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.tipo_camion_requerido}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Pricing */}
          <fieldset>
            <legend className="mb-3 text-base font-bold text-navy">Tarifa</legend>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tarifa_ars" required>
                  Tarifa
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    $
                  </span>
                  <Input
                    id="tarifa_ars"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="Ej: 350000"
                    value={form.tarifa_ars}
                    onChange={handleInputChange('tarifa_ars')}
                    error={!!errors.tarifa_ars}
                    className="px-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    ARS
                  </span>
                </div>
                {errors.tarifa_ars && (
                  <p className="mt-1 text-xs text-red-500">{errors.tarifa_ars}</p>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.tarifa_negociable}
                  onChange={(e) =>
                    updateField('tarifa_negociable', e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy"
                />
                <span className="text-sm text-gray-700">
                  La tarifa es negociable
                </span>
              </label>
            </div>
          </fieldset>

          {/* Dates */}
          <fieldset>
            <legend className="mb-3 text-base font-bold text-navy">Fechas</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fecha_carga" required>
                  Fecha de carga
                </Label>
                <Input
                  id="fecha_carga"
                  type="date"
                  value={form.fecha_carga}
                  onChange={handleInputChange('fecha_carga')}
                  error={!!errors.fecha_carga}
                />
                {errors.fecha_carga && (
                  <p className="mt-1 text-xs text-red-500">{errors.fecha_carga}</p>
                )}
              </div>
              <div>
                <Label htmlFor="fecha_entrega" optional>
                  Fecha de entrega
                </Label>
                <Input
                  id="fecha_entrega"
                  type="date"
                  value={form.fecha_entrega}
                  onChange={handleInputChange('fecha_entrega')}
                />
              </div>
            </div>
          </fieldset>

          {/* Observations */}
          <div>
            <Label htmlFor="observaciones" optional>
              Observaciones
            </Label>
            <Textarea
              id="observaciones"
              rows={3}
              placeholder="Información adicional, horarios, requisitos especiales..."
              value={form.observaciones}
              onChange={handleInputChange('observaciones')}
            />
          </div>

          {/* API Error */}
          {apiError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {apiError}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner size="sm" />
                Publicando...
              </>
            ) : (
              'Publicar carga'
            )}
          </Button>
        </Card>
      </form>

      {/* Success modal */}
      <Modal open={showSuccess} onClose={handleSuccessClose} title="Carga publicada">
        <div className="text-center">
          <span className="text-5xl">✅</span>
          <p className="mt-4 text-gray-600">
            Tu carga fue publicada con éxito. Los transportistas ya pueden verla y
            postularse.
          </p>
          <Button
            variant="secondary"
            size="md"
            className="mt-6"
            onClick={handleSuccessClose}
          >
            Ver mis cargas
          </Button>
        </div>
      </Modal>
    </div>
  );
}
