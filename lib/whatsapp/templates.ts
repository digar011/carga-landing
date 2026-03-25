// ============================================
// WhatsApp Business API — Message Template Definitions
// All templates registered in Meta Business Manager
// Language: Argentine Spanish (es_AR)
// ============================================

interface TTemplateComponent {
  type: 'body' | 'header';
  parameters: { type: 'text'; text: string }[];
}

interface TTemplateMessage {
  templateName: string;
  languageCode: string;
  components: TTemplateComponent[];
}

// ============================================
// Template Constants
// ============================================

/** Nueva carga disponible que coincide con el perfil del transportista */
export const NEW_LOAD_TEMPLATE = {
  name: 'carga_nueva',
  language: 'es_AR',
} as const;

/** Postulación aceptada por el cargador */
export const APPLICATION_ACCEPTED_TEMPLATE = {
  name: 'postulacion_aceptada',
  language: 'es_AR',
} as const;

/** Postulación rechazada por el cargador */
export const APPLICATION_REJECTED_TEMPLATE = {
  name: 'postulacion_rechazada',
  language: 'es_AR',
} as const;

/** Cambio de estado en una carga */
export const LOAD_STATUS_TEMPLATE = {
  name: 'estado_carga',
  language: 'es_AR',
} as const;

/** Bienvenida al registrarse en CarGA */
export const WELCOME_TEMPLATE = {
  name: 'bienvenida',
  language: 'es_AR',
} as const;

// ============================================
// Template Parameter Builders
// ============================================

/**
 * Construye el mensaje de nueva carga disponible
 * Params: origen, destino, tarifa formateada (ej: "$150.000")
 */
export function buildNewLoadMessage(
  origen: string,
  destino: string,
  tarifaFormatted: string
): TTemplateMessage {
  return {
    templateName: NEW_LOAD_TEMPLATE.name,
    languageCode: NEW_LOAD_TEMPLATE.language,
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: origen },
          { type: 'text', text: destino },
          { type: 'text', text: tarifaFormatted },
        ],
      },
    ],
  };
}

/**
 * Construye el mensaje de postulación aceptada
 * Params: ruta (ej: "Rosario → Buenos Aires"), empresa del cargador
 */
export function buildApplicationAcceptedMessage(
  ruta: string,
  empresaCargador: string
): TTemplateMessage {
  return {
    templateName: APPLICATION_ACCEPTED_TEMPLATE.name,
    languageCode: APPLICATION_ACCEPTED_TEMPLATE.language,
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: ruta },
          { type: 'text', text: empresaCargador },
        ],
      },
    ],
  };
}

/**
 * Construye el mensaje de postulación rechazada
 * Params: ruta (ej: "Córdoba → Mendoza")
 */
export function buildApplicationRejectedMessage(
  ruta: string
): TTemplateMessage {
  return {
    templateName: APPLICATION_REJECTED_TEMPLATE.name,
    languageCode: APPLICATION_REJECTED_TEMPLATE.language,
    components: [
      {
        type: 'body',
        parameters: [{ type: 'text', text: ruta }],
      },
    ],
  };
}

/**
 * Construye el mensaje de cambio de estado de carga
 * Params: ruta, nuevo estado (ej: "En camino", "Entregada")
 */
export function buildLoadStatusMessage(
  ruta: string,
  nuevoEstado: string
): TTemplateMessage {
  return {
    templateName: LOAD_STATUS_TEMPLATE.name,
    languageCode: LOAD_STATUS_TEMPLATE.language,
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: ruta },
          { type: 'text', text: nuevoEstado },
        ],
      },
    ],
  };
}

/**
 * Construye el mensaje de bienvenida
 * Params: nombre del usuario
 */
export function buildWelcomeMessage(nombre: string): TTemplateMessage {
  return {
    templateName: WELCOME_TEMPLATE.name,
    languageCode: WELCOME_TEMPLATE.language,
    components: [
      {
        type: 'body',
        parameters: [{ type: 'text', text: nombre }],
      },
    ],
  };
}
