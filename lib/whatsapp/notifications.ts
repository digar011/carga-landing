import { createServiceRoleClient } from '@/lib/supabase/server';
import { sendWhatsAppTemplate } from '@/lib/whatsapp/client';
import {
  buildApplicationAcceptedMessage,
  buildApplicationRejectedMessage,
  buildLoadStatusMessage,
  buildWelcomeMessage,
} from '@/lib/whatsapp/templates';

// ============================================
// High-Level WhatsApp Notification Helpers
// Cada función: busca WhatsApp del usuario, intenta enviar,
// crea notificación in-app como fallback
// ============================================

interface TNotificationResult {
  whatsapp: boolean;
  inApp: boolean;
}

/**
 * Busca el número de WhatsApp de un transportista por su user_id
 */
async function getTransportistaWhatsApp(
  userId: string
): Promise<{ whatsapp: string | null; nombre: string }> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('profiles_transportista')
    .select('whatsapp, nombre')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error(
      `[Notificaciones] Error buscando perfil transportista para ${userId}:`,
      error?.message ?? 'No encontrado'
    );
    return { whatsapp: null, nombre: 'Usuario' };
  }

  return {
    whatsapp: data.whatsapp as string | null,
    nombre: data.nombre as string,
  };
}

/**
 * Crea una notificación in-app en la base de datos
 */
async function createInAppNotification(
  userId: string,
  tipo: string,
  titulo: string,
  mensaje: string,
  metadata: Record<string, unknown>
): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    tipo,
    titulo,
    mensaje,
    metadata,
  });

  if (error) {
    console.error(
      `[Notificaciones] Error creando notificación in-app para ${userId}:`,
      error.message
    );
    return false;
  }

  return true;
}

/**
 * Notifica al transportista que su postulación fue aceptada.
 * WhatsApp primero, in-app como fallback.
 */
export async function notifyApplicationAccepted(
  transportistaUserId: string,
  loadId: string,
  ruta: string,
  empresaCargador: string
): Promise<TNotificationResult> {
  const { whatsapp } = await getTransportistaWhatsApp(transportistaUserId);

  let whatsappSent = false;

  if (whatsapp) {
    const template = buildApplicationAcceptedMessage(ruta, empresaCargador);
    whatsappSent = await sendWhatsAppTemplate({
      to: whatsapp,
      templateName: template.templateName,
      languageCode: template.languageCode,
      components: template.components,
    });
  }

  const inAppCreated = await createInAppNotification(
    transportistaUserId,
    'aplicacion_aceptada',
    'Postulación aceptada',
    `Tu postulación para la ruta ${ruta} fue aceptada por ${empresaCargador}`,
    {
      load_id: loadId,
      ruta,
      empresa_cargador: empresaCargador,
      whatsapp_sent: whatsappSent,
    }
  );

  return { whatsapp: whatsappSent, inApp: inAppCreated };
}

/**
 * Notifica al transportista que su postulación fue rechazada.
 * WhatsApp primero, in-app como fallback.
 */
export async function notifyApplicationRejected(
  transportistaUserId: string,
  loadId: string,
  ruta: string
): Promise<TNotificationResult> {
  const { whatsapp } = await getTransportistaWhatsApp(transportistaUserId);

  let whatsappSent = false;

  if (whatsapp) {
    const template = buildApplicationRejectedMessage(ruta);
    whatsappSent = await sendWhatsAppTemplate({
      to: whatsapp,
      templateName: template.templateName,
      languageCode: template.languageCode,
      components: template.components,
    });
  }

  const inAppCreated = await createInAppNotification(
    transportistaUserId,
    'aplicacion_rechazada',
    'Postulación no seleccionada',
    `Tu postulación para la ruta ${ruta} no fue seleccionada en esta oportunidad`,
    {
      load_id: loadId,
      ruta,
      whatsapp_sent: whatsappSent,
    }
  );

  return { whatsapp: whatsappSent, inApp: inAppCreated };
}

/**
 * Notifica al usuario sobre un cambio de estado en una carga.
 * WhatsApp primero, in-app como fallback.
 */
export async function notifyLoadStatusChange(
  userId: string,
  loadId: string,
  ruta: string,
  nuevoEstado: string
): Promise<TNotificationResult> {
  const { whatsapp } = await getTransportistaWhatsApp(userId);

  let whatsappSent = false;

  if (whatsapp) {
    const template = buildLoadStatusMessage(ruta, nuevoEstado);
    whatsappSent = await sendWhatsAppTemplate({
      to: whatsapp,
      templateName: template.templateName,
      languageCode: template.languageCode,
      components: template.components,
    });
  }

  const inAppCreated = await createInAppNotification(
    userId,
    'estado_carga',
    'Actualización de carga',
    `La carga ${ruta} cambió a estado: ${nuevoEstado}`,
    {
      load_id: loadId,
      ruta,
      nuevo_estado: nuevoEstado,
      whatsapp_sent: whatsappSent,
    }
  );

  return { whatsapp: whatsappSent, inApp: inAppCreated };
}

/**
 * Envía mensaje de bienvenida al nuevo usuario.
 * WhatsApp primero, in-app como fallback.
 */
export async function sendWelcomeNotification(
  userId: string,
  nombre: string
): Promise<TNotificationResult> {
  const { whatsapp } = await getTransportistaWhatsApp(userId);

  let whatsappSent = false;

  if (whatsapp) {
    const template = buildWelcomeMessage(nombre);
    whatsappSent = await sendWhatsAppTemplate({
      to: whatsapp,
      templateName: template.templateName,
      languageCode: template.languageCode,
      components: template.components,
    });
  }

  const inAppCreated = await createInAppNotification(
    userId,
    'sistema',
    'Bienvenido a CarGA',
    `Hola ${nombre}, bienvenido a CarGA. Empezá a buscar cargas disponibles en tu zona.`,
    {
      whatsapp_sent: whatsappSent,
    }
  );

  return { whatsapp: whatsappSent, inApp: inAppCreated };
}
