import type { Lead } from '@/app/portal/leads/context';

export type LeadStatus = Lead['status'];

interface StatusMeta {
  label: string;
  badgeClass: string;
  dotColor: string;
}

const BASE: Record<LeadStatus, Omit<StatusMeta, 'label'>> = {
  new: { badgeClass: 'bg-[var(--signal)]/15 text-[var(--signal)] border border-[var(--signal)]/30', dotColor: 'bg-[var(--signal)]' },
  contacted: { badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', dotColor: 'bg-blue-400' },
  won: { badgeClass: 'bg-olive-500/10 text-olive-400 border border-olive-500/20', dotColor: 'bg-olive-400' },
  lost: { badgeClass: 'bg-gray-800/30 text-gray-400 border border-gray-700', dotColor: 'bg-gray-500' },
};

const REQUEST_LABELS: Record<LeadStatus, string> = { new: 'Nuevo', contacted: 'En seguimiento', won: 'Matriculado', lost: 'Descartado' };
// Same pipeline, worded for a scheduled call
const CALL_LABELS: Record<LeadStatus, string> = { new: 'Agendada', contacted: 'Realizada', won: 'Matriculado', lost: 'Cancelada' };

export function statusMeta(status: LeadStatus, kind: Lead['kind'] = 'proposal'): StatusMeta {
  return { ...BASE[status], label: (kind === 'call' ? CALL_LABELS : REQUEST_LABELS)[status] };
}

export function statusOptions(kind: Lead['kind']): { value: LeadStatus; label: string }[] {
  const labels = kind === 'call' ? CALL_LABELS : REQUEST_LABELS;
  return (Object.keys(labels) as LeadStatus[]).map((value) => ({ value, label: labels[value] }));
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return new Date(dateStr).toLocaleDateString('es-ES');
}

/** Teléfono → enlace de WhatsApp (sin + ni espacios; añade el prefijo de España a números de 9 cifras). */
export function whatsappUrl(phone: string | null | undefined): string | null {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 9) return null;
  return `https://wa.me/${digits.length === 9 ? `34${digits}` : digits}`;
}

/** Clave para reconocer a la misma persona en varias solicitudes: email en minúsculas o últimas 9 cifras del teléfono. */
export function contactKeys(l: { email?: string | null; phone?: string | null }): string[] {
  const keys: string[] = [];
  const email = (l.email || '').trim().toLowerCase();
  const phone = (l.phone || '').replace(/\D/g, '').slice(-9);
  if (email) keys.push(`e:${email}`);
  if (phone.length === 9) keys.push(`p:${phone}`);
  return keys;
}

/** Programa que le interesa: lo que eligió en el formulario («¿Qué te interesa?») o la línea «Interés:» del mensaje. */
export function leadInterest(l: Pick<Lead, 'answers' | 'message'>): string | null {
  const needs = l.answers?.needs?.filter(Boolean);
  if (needs?.length) return needs.join(', ');
  const m = /^Interés:\s*(.+)$/m.exec(l.message || '');
  return m ? m[1].trim() : null;
}

/** Por dónde entró y, si vino de un anuncio, la campaña (utm_campaign o, si no, utm_source). */
export function leadChannel(l: Pick<Lead, 'source' | 'kind' | 'answers'>): { label: string; campaign: string | null } {
  const utm = l.answers?.utm;
  const campaign = utm?.utm_campaign || utm?.utm_source || null;
  if (l.source === 'manual') return { label: 'Manual', campaign };
  if (l.source === 'landing') return { label: 'Landing', campaign };
  return { label: l.kind === 'call' ? 'Web · llamada' : 'Web', campaign };
}

/** El comentario de la persona, sin las líneas que añade la web («Interés:», «Origen:») ni el relleno por defecto. */
export function leadNote(message: string | null | undefined): string {
  return (message || '')
    .split('\n')
    .filter((line) => !/^(Interés|Origen):/.test(line) && line.trim() !== 'Sin comentarios adicionales.')
    .join('\n')
    .trim();
}
