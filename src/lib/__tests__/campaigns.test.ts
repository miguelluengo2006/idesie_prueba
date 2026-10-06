import { describe, it, expect } from 'vitest';
import {
  applyVariables,
  bodyToHtml,
  bodyToText,
  campaignProblems,
  firstName,
  renderCampaignEmail,
  unsubscribeUrl,
} from '../campaigns';

describe('variables', () => {
  it('usa el primer nombre y la empresa', () => {
    expect(firstName('Ana María Pérez')).toBe('Ana');
    expect(applyVariables('Hola {{nombre}} de {{empresa}}', { email: 'a@b.es', name: 'Ana María', company: 'Acme' })).toBe('Hola Ana de Acme');
    expect(applyVariables('Tu email: {{ email }}', { email: 'a@b.es' })).toBe('Tu email: a@b.es');
  });

  it('da un valor alternativo o quita el hueco cuando falta el dato', () => {
    expect(applyVariables('Hola {{nombre|amigo}}', { email: 'a@b.es' })).toBe('Hola amigo');
    expect(applyVariables('Hola {{nombre}}, qué tal', { email: 'a@b.es' })).toBe('Hola, qué tal');
  });

  it('quita las variables desconocidas en vez de enseñarlas', () => {
    expect(applyVariables('{{otra}}', { email: 'a@b.es' })).toBe('');
  });
});

describe('formato del cuerpo', () => {
  it('escapa el HTML para que nadie inyecte etiquetas', () => {
    const html = bodyToHtml('<script>alert(1)</script> & más');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp; más');
  });

  it('separa párrafos, respeta saltos de línea y pone negrita', () => {
    const html = bodyToHtml('Hola **mundo**\nsegunda línea\n\nOtro párrafo');
    expect((html.match(/<p /g) || []).length).toBe(2);
    expect(html).toContain('<strong>mundo</strong>');
    expect(html).toContain('<br>');
  });

  it('convierte enlaces, URLs sueltas, listas y botones', () => {
    expect(bodyToHtml('[Mira](https://idesie.com/perfiles/bdm)')).toContain('href="https://idesie.com/perfiles/bdm"');
    expect(bodyToHtml('Entra en https://idesie.com.')).toContain('<a href="https://idesie.com"');
    expect(bodyToHtml('- uno\n- dos')).toContain('<ul');
    const btn = bodyToHtml('[[Ver el máster|https://idesie.com/#formacion]]');
    expect(btn).toContain('Ver el máster');
    expect(btn).toContain('border-radius:999px');
  });

  it('rechaza enlaces peligrosos (javascript:)', () => {
    expect(bodyToHtml('[x](javascript:alert(1))')).not.toContain('href="javascript');
    expect(bodyToHtml('[[Click|javascript:alert(1)]]')).not.toContain('href="javascript');
  });

  it('el texto plano deja las URLs a la vista', () => {
    expect(bodyToText('**Hola** [web](https://idesie.com)\n\n[[Botón|https://idesie.com/x]]')).toBe('Hola web (https://idesie.com)\n\nBotón: https://idesie.com/x');
  });
});

describe('email completo', () => {
  const r = renderCampaignEmail({
    subject: 'Hola {{nombre}}\n— novedades',
    body: 'Te contamos **novedades** de {{empresa}}.',
    recipient: { email: 'ana@acme.com', name: 'Ana Ruiz', company: 'Acme' },
    unsubscribeUrl: unsubscribeUrl('https://idesie.com/', 'tok en'),
  });

  it('aplica variables al asunto y lo deja en una línea', () => {
    expect(r.subject).toBe('Hola Ana — novedades');
  });

  it('incluye el enlace de baja y los datos de IDESIE en HTML y texto', () => {
    expect(r.html).toContain('https://idesie.com/baja?t=tok%20en');
    expect(r.html).toContain('Darme de baja');
    expect(r.html).toContain('Calle San Aquilino, 13');
    expect(r.text).toContain('https://idesie.com/baja?t=tok%20en');
    expect(r.html).toContain('<strong>novedades</strong> de Acme');
  });
});

describe('validación previa al envío', () => {
  it('avisa de lo que falta', () => {
    expect(campaignProblems({ subject: '', body: '' }, 0)).toHaveLength(3);
    expect(campaignProblems({ subject: 'a', body: 'b' }, 10)).toEqual([]);
    expect(campaignProblems({ subject: 'a', body: 'b' }, 0)).toHaveLength(1);
  });
});
