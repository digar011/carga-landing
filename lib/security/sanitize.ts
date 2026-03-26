/**
 * Utilidades de sanitización de entrada.
 * Previene XSS e inyección en datos ingresados por el usuario.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;
const SPECIAL_CHAR_REGEX = /[&<>"'`/]/g;

/**
 * Elimina etiquetas HTML y codifica caracteres especiales para prevenir XSS.
 */
export function sanitizeHtml(input: string): string {
  // Primero eliminar todas las etiquetas HTML
  const stripped = input.replace(HTML_TAG_REGEX, '');

  // Luego codificar caracteres especiales restantes
  return stripped.replace(
    SPECIAL_CHAR_REGEX,
    (char) => HTML_ENTITY_MAP[char] ?? char,
  );
}

/**
 * Patrones potencialmente peligrosos en consultas de búsqueda.
 * Previene inyección SQL básica y otros ataques vía input de búsqueda.
 */
const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|TRUNCATE)\b)/gi,
  /(-{2,})/g,            // Comentarios SQL (--)
  /(;[\s]*$)/g,          // Punto y coma al final
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi, // OR 1=1 / AND 1=1
  /(\/\*[\s\S]*?\*\/)/g, // Comentarios SQL en bloque
];

/** Largo máximo permitido para consultas de búsqueda */
const MAX_SEARCH_LENGTH = 200;

/**
 * Sanitiza una consulta de búsqueda eliminando patrones de inyección SQL
 * y limitando la longitud.
 */
export function sanitizeSearchQuery(input: string): string {
  let cleaned = input.trim();

  // Limitar largo
  if (cleaned.length > MAX_SEARCH_LENGTH) {
    cleaned = cleaned.slice(0, MAX_SEARCH_LENGTH);
  }

  // Eliminar patrones SQL sospechosos
  for (const pattern of SQL_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  return cleaned.trim();
}

/**
 * Sanitización general de entrada de usuario.
 * Recorta espacios, normaliza whitespace y elimina HTML.
 */
export function sanitizeUserInput(input: string): string {
  // Recortar espacios al inicio y final
  let cleaned = input.trim();

  // Normalizar whitespace múltiple a un solo espacio
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Sanitizar HTML
  cleaned = sanitizeHtml(cleaned);

  return cleaned;
}
