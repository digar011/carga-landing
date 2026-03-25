import { NextRequest, NextResponse } from 'next/server';

// ============================================
// WhatsApp Business API Webhook
// Handles verification + incoming messages/status updates from Meta
// ============================================

/**
 * Meta webhook payload types
 */
interface TWhatsAppWebhookEntry {
  id: string;
  changes: TWhatsAppChange[];
}

interface TWhatsAppChange {
  value: {
    messaging_product: string;
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    statuses?: TWhatsAppStatus[];
    messages?: TWhatsAppIncomingMessage[];
    contacts?: TWhatsAppContact[];
  };
  field: string;
}

interface TWhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: { code: number; title: string; message: string }[];
}

interface TWhatsAppIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'interactive' | 'button';
  text?: { body: string };
}

interface TWhatsAppContact {
  profile: { name: string };
  wa_id: string;
}

interface TWhatsAppWebhookPayload {
  object: string;
  entry: TWhatsAppWebhookEntry[];
}

/**
 * GET — Webhook verification (Meta sends hub.mode, hub.challenge, hub.verify_token)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error('[WhatsApp Webhook] WHATSAPP_VERIFY_TOKEN no está configurado');
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta' },
      { status: 500 }
    );
  }

  if (mode === 'subscribe' && token === verifyToken) {
    console.info('[WhatsApp Webhook] Verificación exitosa');
    return new NextResponse(challenge, { status: 200 });
  }

  console.error('[WhatsApp Webhook] Verificación fallida — token inválido');
  return NextResponse.json(
    { error: 'Token de verificación inválido' },
    { status: 403 }
  );
}

/**
 * POST — Receive incoming messages and status updates from Meta
 * Must return 200 quickly — Meta retries on slow responses
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = (await request.json()) as TWhatsAppWebhookPayload;

    if (payload.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Objeto no reconocido' }, { status: 400 });
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages') continue;

        const { statuses, messages, contacts } = change.value;

        // Process status updates (sent, delivered, read, failed)
        if (statuses) {
          for (const status of statuses) {
            handleStatusUpdate(status);
          }
        }

        // Process incoming messages
        if (messages && contacts) {
          for (const message of messages) {
            const contact = contacts.find((c) => c.wa_id === message.from);
            handleIncomingMessage(message, contact);
          }
        }
      }
    }

    // Return 200 immediately as required by Meta
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[WhatsApp Webhook] Error procesando payload:', error);
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

/**
 * Handle message status updates (sent, delivered, read, failed)
 */
function handleStatusUpdate(status: TWhatsAppStatus): void {
  const { id, status: statusValue, recipient_id, timestamp } = status;

  if (statusValue === 'failed' && status.errors) {
    console.error(
      `[WhatsApp Status] FALLO mensaje ${id} para ${recipient_id}:`,
      status.errors.map((e) => `${e.code}: ${e.title}`).join(', ')
    );
    return;
  }

  console.info(
    `[WhatsApp Status] Mensaje ${id} → ${statusValue} | Destinatario: ${recipient_id} | Timestamp: ${timestamp}`
  );
}

/**
 * Handle incoming messages from users
 * TODO: Phase 2 — route to in-app chat system
 */
function handleIncomingMessage(
  message: TWhatsAppIncomingMessage,
  contact: TWhatsAppContact | undefined
): void {
  const senderName = contact?.profile.name ?? 'Desconocido';
  const messageContent =
    message.type === 'text' && message.text
      ? message.text.body
      : `[${message.type}]`;

  console.info(
    `[WhatsApp Mensaje] De: ${message.from} (${senderName}) | Tipo: ${message.type} | Contenido: ${messageContent}`
  );

  // TODO Phase 2: Route incoming messages to in-app chat
  // - Match sender phone to user profile
  // - Create chat message record
  // - Trigger realtime notification
}
