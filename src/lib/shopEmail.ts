import { esc } from '@/lib/emailTemplates';
import { formatEur } from '@/lib/shop';
import { CONTACT } from '@/lib/bim';

export interface OrderMail {
  number: string;
  buyerFirstName: string;
  totalCents: number;
  discountCents: number;
  couponCode: string | null;
  items: { name: string; unitCents: number }[];
}

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

/** Correo al comprador cuando el pago queda confirmado. Estilos en línea para que se vea igual en cualquier cliente. */
export function orderPaidEmail(o: OrderMail): { subject: string; html: string; text: string } {
  const rows = o.items
    .map((i) => `<tr><td style="padding:10px 0;border-bottom:1px solid #dbe8ff;font:15px ${FONT};color:#0a1f44">${esc(i.name)}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #dbe8ff;font:15px ${FONT};color:#0a1f44;white-space:nowrap">${esc(i.unitCents === 0 ? 'Gratis' : formatEur(i.unitCents))}</td></tr>`)
    .join('');
  const discount = o.discountCents > 0
    ? `<tr><td style="padding:10px 0;font:14px ${FONT};color:#0052cc">Descuento${o.couponCode ? ` (${esc(o.couponCode)})` : ''}</td><td align="right" style="padding:10px 0;font:14px ${FONT};color:#0052cc">−${esc(formatEur(o.discountCents))}</td></tr>`
    : '';
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#e9f0fc;padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#0a1f44;padding:24px 28px;font:700 22px ${FONT};color:#ffffff">idesie<span style="color:#7db4ff">.</span></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 12px;font:700 22px ${FONT};color:#0a1f44">¡Gracias, ${esc(o.buyerFirstName)}! Hemos recibido tu pago</h1>
<p style="margin:0 0 20px;font:15px/1.6 ${FONT};color:#0a1f44">Tu pedido <strong>${esc(o.number)}</strong> está confirmado. El equipo de IDESIE se pondrá en contacto contigo para los siguientes pasos de tu matrícula.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}${discount}
<tr><td style="padding:14px 0 0;font:700 16px ${FONT};color:#0a1f44">Total pagado (IVA incluido)</td><td align="right" style="padding:14px 0 0;font:700 18px ${FONT};color:#0063e6">${esc(o.totalCents === 0 ? 'Gratis' : formatEur(o.totalCents))}</td></tr></table>
<p style="margin:24px 0 0;font:14px/1.6 ${FONT};color:#3a4b6b">¿Dudas? Escríbenos a <a href="mailto:${esc(CONTACT.email)}" style="color:#0063e6">${esc(CONTACT.email)}</a> o llama al ${esc(CONTACT.phone)}.</p>
</td></tr></table></td></tr></table></body></html>`;
  const text = [
    `¡Gracias, ${o.buyerFirstName}! Hemos recibido tu pago.`,
    `Pedido ${o.number}`,
    ...o.items.map((i) => `- ${i.name}: ${i.unitCents === 0 ? 'Gratis' : formatEur(i.unitCents)}`),
    ...(o.discountCents > 0 ? [`Descuento${o.couponCode ? ` (${o.couponCode})` : ''}: -${formatEur(o.discountCents)}`] : []),
    `Total pagado (IVA incluido): ${o.totalCents === 0 ? 'Gratis' : formatEur(o.totalCents)}`,
    '',
    `El equipo de IDESIE se pondrá en contacto contigo para los siguientes pasos. Dudas: ${CONTACT.email} · ${CONTACT.phone}`,
  ].join('\n');
  return { subject: `Pedido ${o.number} confirmado · IDESIE`, html, text };
}
