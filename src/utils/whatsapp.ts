/**
 * WhatsApp integration utilities for Click Videorecords CRM
 */

export function sanitizePhoneNumber(phone: string): string {
  // Remove spaces, parentheses, dashes, plus signs
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // If 10 digits (Mexican phone number like 9994128765), prepend Mexico country code 52
  if (cleaned.length === 10) {
    cleaned = '52' + cleaned;
  }
  
  return cleaned;
}

export function generateWhatsAppMessage(
  templateType: 'quote' | 'appointment' | 'balance' | 'greeting' | 'session' | 'custom',
  data: {
    clientName: string;
    eventType?: string;
    eventDate?: string;
    date?: string;
    time?: string;
    location?: string;
    balanceDue?: number;
    appointmentTitle?: string;
    customText?: string;
  }
): string {
  const brand = 'Click Videorecords';
  
  switch (templateType) {
    case 'quote':
      return `¡Hola ${data.clientName}! 👋 Te saludamos con mucho gusto desde *${brand}*. Con relación a tu evento (${data.eventType || 'boda / evento'}), estamos a tu disposición para compartirte nuestras propuestas y paquetes de video y fotografía en Mérida. ¿Te gustaría que agendemos una breve llamada o videollamada para resolver tus dudas? 🎥✨`;
      
    case 'appointment':
      return `¡Hola ${data.clientName}! Te recordamos tu cita con *${brand}*:
📅 *Fecha:* ${data.date || 'Pronto'}
⏰ *Hora:* ${data.time || 'Por confirmar'}
📍 *Lugar / Enlace:* ${data.location || 'Estudio / Enlace'}
📌 *Motivo:* ${data.appointmentTitle || 'Seguimiento de evento'}

Por favor confírmanos si este horario sigue siendo ideal para ti. ¡Nos dará mucho gusto atenderte! 🎥`;

    case 'balance':
      return `Estimado(a) ${data.clientName}, ¡esperamos que te encuentres de maravilla! Te enviamos este recordatorio amigable del saldo pendiente de tu evento (${data.eventType || 'evento'} - ${data.eventDate || ''}):
💰 *Saldo pendiente:* $${data.balanceDue?.toLocaleString('es-MX') || 0} MXN.
Quedamos a tus órdenes para proporcionarte los datos de transferencia bancaria o recibo. ¡Gracias por confiar en *${brand}*!`;

    case 'session':
      return `¡Hola ${data.clientName}! Te confirmamos los detalles de tu sesión fotográfica con *${brand}*:
📅 *Fecha:* ${data.date || ''}
⏰ *Hora:* ${data.time || ''}
📍 *Locación:* ${data.location || ''}
Recomendaciones: Llevar ropa cómoda para el trayecto, maquillaje retocado y sus mejores sonrisas. ¡Haremos tomas increíbles! 📸✨`;

    case 'greeting':
    default:
      return `¡Hola ${data.clientName}! Te saludamos cordialmente de *${brand}*. ¿En qué podemos apoyarte hoy con respecto a tu evento? Quedamos a tu entera disposición. 🎬`;
  }
}

export function openWhatsApp(phone: string, message: string): void {
  const cleanPhone = sanitizePhoneNumber(phone);
  const encoded = encodeURIComponent(message);
  const url = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
