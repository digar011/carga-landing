// WhatsApp Business API client scaffold
// Configure with WHATSAPP_* environment variables

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION = 'v18.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`;

interface TWhatsAppMessage {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: TTemplateComponent[];
}

interface TTemplateComponent {
  type: 'body' | 'header';
  parameters: { type: 'text'; text: string }[];
}

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = 'es_AR',
  components,
}: TWhatsAppMessage): Promise<boolean> {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WhatsApp] Not configured — message not sent:', { to, templateName });
    }
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[WhatsApp] Send error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[WhatsApp] Failed to send:', error);
    return false;
  }
}

// Pre-defined template helpers
export function notifyNewLoad(
  whatsappNumber: string,
  origen: string,
  destino: string,
  tarifa: string
) {
  return sendWhatsAppTemplate({
    to: whatsappNumber,
    templateName: 'new_matching_load',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: origen },
          { type: 'text', text: destino },
          { type: 'text', text: tarifa },
        ],
      },
    ],
  });
}

export function notifyApplicationAccepted(
  whatsappNumber: string,
  ruta: string
) {
  return sendWhatsAppTemplate({
    to: whatsappNumber,
    templateName: 'application_accepted',
    components: [
      {
        type: 'body',
        parameters: [{ type: 'text', text: ruta }],
      },
    ],
  });
}
