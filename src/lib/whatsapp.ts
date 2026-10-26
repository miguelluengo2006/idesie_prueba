/**
 * Mensajes de WhatsApp para contactar con un lead o un contacto desde el panel.
 * Cada «motivo» abre el chat con el texto ya escrito (sin enviarlo): quien lo manda lo repasa y lo cambia si quiere.
 */
import { CONTACT } from '@/lib/bim';
import { whatsappDigits } from '@/lib/contact';
import { formatCallDate, formatCallTime } from '@/lib/booking';
import { formatStartDate, type LeadStatus } from '@/lib/admissions';

export type WaIntent = 'call' | 'reminder' | 'info' | 'admission' | 'enrol' | 'welcome' | 'blank';

export const WA_INTENTS: { id: WaIntent; label: string; hint: string }[] = [
  { id: 'call', label: 'Agendar una llamada', hint: 'Le pasas tu calendario para que elija hueco' },
  { id: 'reminder', label: 'Recordar la llamada', hint: 'Avisa del día y la hora, o le deja cambiarla' },
  { id: 'info', label: 'Enviar información', hint: 'Responde a su interés y pregunta qué necesita' },
  { id: 'admission', label: 'Seguimiento de admisión', hint: 'Pregunta cómo va y si le falta algo' },
  { id: 'enrol', label: 'Confirmar matrícula', hint: 'Su plaza está reservada; falta el pago' },
  { id: 'welcome', label: 'Dar la bienvenida', hint: 'Ya ha pagado: confirma su plaza' },
  { id: 'blank', label: 'Mensaje en blanco', hint: 'Abre el chat sin texto' },
];

/** Qué motivo conviene según en qué punto del proceso está la persona. */
export function suggestedIntent(status: LeadStatus | string | null | undefined): WaIntent {
  switch (status) {
    case 'new': return 'call';
    case 'admission': return 'admission';
    case 'call': return 'reminder';
    case 'enrolled': return 'enrol';
    case 'paid': return 'welcome';
    default: return 'info';
  }
}

export interface WaContext {
  name?: string | null;
  /** Programa que le interesa («Máster BIM Full Time»…) */
  interest?: string | null;
  /** Llamada ya fijada, si la hay */
  callAt?: string | Date | null;
  cohortName?: string | null;
  /** Inicio de su convocatoria (YYYY-MM-DD) */
  startsAt?: string | null;
  /** Enlace de reserva; por defecto el calendario de IDESIE */
  calendlyUrl?: string;
}

/** «ana lópez» → «Ana»; un email o nada → '' (el saludo queda sin nombre). */
export function firstName(name: string | null | undefined): string {
  const first = (name || '').trim().split(/\s+/)[0] || '';
  if (!first || first.includes('@') || /\d/.test(first)) return '';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function waMessage(intent: WaIntent, ctx: WaContext = {}): string {
  if (intent === 'blank') return '';
  const name = firstName(ctx.name);
  const hello = name ? `Hola ${name}, te escribimos de ${CONTACT.name}.` : `Hola, te escribimos de ${CONTACT.name}.`;
  const calendar = ctx.calendlyUrl || CONTACT.calendlyUrl;
  const about = ctx.interest ? ` sobre ${ctx.interest}` : '';
  const start = ctx.startsAt ? ` El curso empieza el ${formatStartDate(ctx.startsAt)}.` : '';
  const group = ctx.cohortName ? ` (${ctx.cohortName})` : '';

  switch (intent) {
    case 'call':
      return `${hello} Vimos que te interesa${ctx.interest ? ` ${ctx.interest}` : ' nuestra formación'}. ¿Te viene bien que lo hablemos en una llamada corta? Elige el hueco que prefieras aquí: ${calendar}`;
    case 'reminder': {
      if (ctx.callAt) {
        const when = `${formatCallDate(ctx.callAt)} a las ${formatCallTime(ctx.callAt)}`;
        return `${hello} Te recordamos que tenemos una llamada el ${when.charAt(0).toLowerCase() + when.slice(1)}. Si necesitas cambiarla, reserva otro hueco aquí: ${calendar}`;
      }
      return `${hello} Te recordamos nuestra llamada. Si necesitas cambiar el día o la hora, reserva otro hueco aquí: ${calendar}`;
    }
    case 'info':
      return `${hello} Gracias por tu interés${about}. ¿Qué te gustaría saber? Te cuento el plan de estudios, las fechas y cómo funciona la admisión.`;
    case 'admission':
      return `${hello} ¿Cómo va todo con tu proceso de admisión${about}? Si tienes alguna duda o te falta algún documento, dímelo y lo vemos juntos.`;
    case 'enrol':
      return `${hello} Tu plaza${group} está reservada.${start} Para confirmarla solo falta completar el pago. ¿Quieres que te explique cómo hacerlo?`;
    case 'welcome':
      return `${hello} Te damos la bienvenida: tu plaza${group} ya está confirmada.${start} Te escribiremos con todo lo que necesitas antes del inicio.`;
  }
}

/** Enlace de WhatsApp con el texto ya escrito; null si el teléfono no sirve. */
export function waLink(phone: string | null | undefined, intent: WaIntent, ctx: WaContext = {}): string | null {
  const digits = whatsappDigits(phone);
  if (digits.length < 8) return null;
  const text = waMessage(intent, ctx);
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
