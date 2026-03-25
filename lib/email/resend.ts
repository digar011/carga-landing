// Resend email scaffold
// Configure with RESEND_API_KEY environment variable

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'CarGA <noreply@carga.com.ar>';

interface TSendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: TSendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Resend] No API key — email not sent:', { to, subject });
    }
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Resend] Error sending email:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Resend] Failed to send email:', error);
    return false;
  }
}

// Email templates
export function welcomeEmail(nombre: string, role: string): { subject: string; html: string } {
  return {
    subject: 'Bienvenido a CarGA',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1A3C5E; font-size: 24px;">🚛 Bienvenido a CarGA</h1>
        <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
          Hola ${nombre},
        </p>
        <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
          Tu cuenta como <strong>${role === 'transportista' ? 'Transportista' : 'Cargador'}</strong> fue creada exitosamente.
          Ya podés empezar a usar CarGA para ${role === 'transportista' ? 'encontrar cargas disponibles' : 'publicar tus cargas'}.
        </p>
        <a href="https://carga.com.ar/panel" style="display: inline-block; background: #C9922A; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 20px;">
          Ir a mi panel →
        </a>
        <p style="color: #9CA3AF; font-size: 13px; margin-top: 40px;">
          © 2025 CarGA — La bolsa de cargas digital de Argentina
        </p>
      </div>
    `,
  };
}
