// AFIP CUIT validation
// Public API — no credentials needed

const AFIP_URL = 'https://afip.tangofactura.com/Rest/GetContribuyenteFull';

interface TAfipResponse {
  errorGetData: boolean;
  Contribuyente: {
    idPersona: number;
    tipoPersona: string;
    razonSocial: string;
    estadoClave: string;
  } | null;
}

interface TCuitValidationResult {
  valid: boolean;
  razonSocial: string | null;
  estadoClave: string | null;
  error: string | null;
}

/**
 * Validate CUIT format: XX-XXXXXXXX-X
 */
export function isValidCuitFormat(cuit: string): boolean {
  const cleaned = cuit.replace(/-/g, '');
  return /^\d{11}$/.test(cleaned);
}

/**
 * Format CUIT as XX-XXXXXXXX-X
 */
export function formatCuit(cuit: string): string {
  const cleaned = cuit.replace(/\D/g, '');
  if (cleaned.length !== 11) return cuit;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
}

/**
 * Validate CUIT against AFIP registry
 */
export async function validateCuit(cuit: string): Promise<TCuitValidationResult> {
  const cleaned = cuit.replace(/-/g, '');

  if (!isValidCuitFormat(cleaned)) {
    return {
      valid: false,
      razonSocial: null,
      estadoClave: null,
      error: 'Formato de CUIT inválido. Debe ser XX-XXXXXXXX-X',
    };
  }

  try {
    const response = await fetch(
      `${AFIP_URL}?cuit=${cleaned}`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!response.ok) {
      return {
        valid: false,
        razonSocial: null,
        estadoClave: null,
        error: 'No se pudo verificar el CUIT. Intentá más tarde.',
      };
    }

    const data: TAfipResponse = await response.json();

    if (data.errorGetData || !data.Contribuyente) {
      return {
        valid: false,
        razonSocial: null,
        estadoClave: null,
        error: 'CUIT no encontrado en el registro de AFIP.',
      };
    }

    return {
      valid: data.Contribuyente.estadoClave === 'ACTIVO',
      razonSocial: data.Contribuyente.razonSocial,
      estadoClave: data.Contribuyente.estadoClave,
      error:
        data.Contribuyente.estadoClave !== 'ACTIVO'
          ? `CUIT encontrado pero estado: ${data.Contribuyente.estadoClave}`
          : null,
    };
  } catch {
    return {
      valid: false,
      razonSocial: null,
      estadoClave: null,
      error: 'Error de conexión con AFIP. Intentá más tarde.',
    };
  }
}
