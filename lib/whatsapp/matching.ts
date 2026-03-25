import { createServiceRoleClient } from '@/lib/supabase/server';
import { sendWhatsAppTemplate } from '@/lib/whatsapp/client';
import { buildNewLoadMessage } from '@/lib/whatsapp/templates';
import type { TLoad, TPlan } from '@/types/database';

// ============================================
// Load Matching Engine
// Encuentra transportistas relevantes y les envía
// notificaciones de nuevas cargas por WhatsApp
// ============================================

/** Planes que incluyen alertas por WhatsApp */
const WHATSAPP_ELIGIBLE_PLANS: TPlan[] = ['profesional', 'flota'];

/** Rate limit: máximo 1 WhatsApp por usuario por hora para cargas nuevas */
const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hora

/** In-memory tracker para rate limiting (se resetea con cada deploy) */
const recentlyNotified = new Map<string, number>();

interface TMatchingTransportista {
  whatsapp: string;
  nombre: string;
  user_id: string;
}

interface TMatchingResult {
  sent: number;
  skipped: number;
}

/**
 * Busca transportistas que coinciden con una carga nueva.
 *
 * Criterios:
 * - whatsapp_notifications = true
 * - whatsapp IS NOT NULL
 * - plan IN ('profesional', 'flota') — solo planes pagos reciben alertas
 * - Opcionalmente: habilitaciones incluyen el tipo de camión
 * - Opcionalmente: provincia coincide con origen o destino
 */
export async function findMatchingTransportistas(
  load: Pick<TLoad, 'tipo_camion_requerido' | 'origen_provincia' | 'destino_provincia'>
): Promise<TMatchingTransportista[]> {
  const supabase = createServiceRoleClient();

  let query = supabase
    .from('profiles_transportista')
    .select('whatsapp, nombre, user_id')
    .eq('whatsapp_notifications', true)
    .not('whatsapp', 'is', null)
    .in('plan', WHATSAPP_ELIGIBLE_PLANS);

  // Filter by province: transportistas near origin or destination
  if (load.origen_provincia || load.destino_provincia) {
    const provinces: string[] = [];
    if (load.origen_provincia) provinces.push(load.origen_provincia);
    if (load.destino_provincia) provinces.push(load.destino_provincia);

    query = query.in('provincia', provinces);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Matching] Error buscando transportistas:', error.message);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Filter out entries where whatsapp is somehow null (safety check)
  // and map to the expected shape
  const results: TMatchingTransportista[] = [];

  for (let i = 0; i < data.length; i++) {
    const t = data[i] as { whatsapp: string | null; nombre: string; user_id: string };
    if (t.whatsapp) {
      results.push({
        whatsapp: t.whatsapp,
        nombre: t.nombre,
        user_id: t.user_id,
      });
    }
  }

  return results;
}

/**
 * Notifica a transportistas que coinciden con una carga nueva.
 *
 * - Aplica rate limiting (1 WhatsApp por usuario por hora)
 * - Crea registro de notificación en la base de datos
 * - Retorna cantidad de enviados y saltados
 */
export async function notifyMatchingTransportistas(
  load: TLoad
): Promise<TMatchingResult> {
  const transportistas = await findMatchingTransportistas(load);

  if (transportistas.length === 0) {
    return { sent: 0, skipped: 0 };
  }

  const supabase = createServiceRoleClient();
  const now = Date.now();
  let sent = 0;
  let skipped = 0;

  // Clean up expired rate limit entries
  cleanupRateLimits(now);

  const origen = `${load.origen_ciudad}, ${load.origen_provincia}`;
  const destino = `${load.destino_ciudad}, ${load.destino_provincia}`;
  const tarifaFormatted = formatARS(load.tarifa_ars);

  const templateMessage = buildNewLoadMessage(origen, destino, tarifaFormatted);

  for (const transportista of transportistas) {
    // Check rate limit
    const lastNotified = recentlyNotified.get(transportista.user_id);
    if (lastNotified && now - lastNotified < RATE_LIMIT_MS) {
      skipped++;
      continue;
    }

    // Send WhatsApp message
    const success = await sendWhatsAppTemplate({
      to: transportista.whatsapp,
      templateName: templateMessage.templateName,
      languageCode: templateMessage.languageCode,
      components: templateMessage.components,
    });

    if (success) {
      recentlyNotified.set(transportista.user_id, now);
      sent++;
    } else {
      skipped++;
    }

    // Create in-app notification regardless of WhatsApp result
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: transportista.user_id,
        tipo: 'nueva_carga',
        titulo: 'Nueva carga disponible',
        mensaje: `Nueva carga: ${origen} → ${destino} | ${tarifaFormatted}`,
        metadata: {
          load_id: load.id,
          origen,
          destino,
          tarifa: load.tarifa_ars,
          whatsapp_sent: success,
        },
      });

    if (notifError) {
      console.error(
        `[Matching] Error creando notificación para ${transportista.user_id}:`,
        notifError.message
      );
    }
  }

  console.info(
    `[Matching] Carga ${load.id}: ${sent} WhatsApp enviados, ${skipped} saltados de ${transportistas.length} transportistas`
  );

  return { sent, skipped };
}

/**
 * Limpia entradas expiradas del rate limit tracker
 */
function cleanupRateLimits(now: number): void {
  const entries = Array.from(recentlyNotified.entries());
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry) continue;
    const [userId, timestamp] = entry;
    if (now - timestamp >= RATE_LIMIT_MS) {
      recentlyNotified.delete(userId);
    }
  }
}

/**
 * Formatea un número como pesos argentinos
 * Ejemplo: 150000 → "$150.000"
 */
function formatARS(amount: number): string {
  return `$${amount.toLocaleString('es-AR')}`;
}
