import { describe, it, expect } from 'vitest';
import { buildBlock, campaignStats, deliveryState, insertBlock, pct, STARTER_TEMPLATES, type TrackedSend } from '../campaignTemplates';
import { bodyToHtml, bodyToText, renderCampaignEmail } from '../campaigns';

const send = (o: Partial<TrackedSend> = {}): TrackedSend => ({
  status: 'sent',
  delivered_at: null,
  opened_at: null,
  clicked_at: null,
  bounced_at: null,
  complained_at: null,
  ...o,
});

describe('bloques del editor', () => {
  it('construye cada bloque con el formato del cuerpo', () => {
    expect(buildBlock('heading', { text: 'Hola' })).toBe('# Hola');
    expect(buildBlock('button', { text: 'Ver', url: 'https://idesie.com' })).toBe('[[Ver|https://idesie.com]]');
    expect(buildBlock('button', { text: 'Ver', url: 'https://idesie.com', outline: true })).toBe('[[Ver|https://idesie.com|outline]]');
    expect(buildBlock('image', { text: 'Aula', url: 'https://idesie.com/a.jpg' })).toBe('![Aula](https://idesie.com/a.jpg)');
    expect(buildBlock('divider')).toBe('---');
  });

  it('quita del texto del botón lo que rompería el formato', () => {
    expect(buildBlock('button', { text: 'A|B]]\nC', url: 'https://x.es' })).toBe('[[A B C|https://x.es]]');
  });

  it('inserta en su propio párrafo y deja el cursor detrás', () => {
    const r = insertBlock('Hola\nmundo', '---', 4);
    expect(r.body).toBe('Hola\n\n---\n\nmundo');
    expect(r.body.slice(0, r.cursor)).toBe('Hola\n\n---');
    expect(insertBlock('', '---', 0).body).toBe('---\n\n');
  });
});

describe('render de los bloques nuevos', () => {
  it('título, separador, imagen https y botón con borde', () => {
    const html = bodyToHtml('# Título\n\n---\n\n![Aula](https://idesie.com/a.jpg)\n\n[[Ver|https://idesie.com|outline]]');
    expect(html).toContain('<h1');
    expect(html).toContain('<hr');
    expect(html).toContain('<img src="https://idesie.com/a.jpg" alt="Aula"');
    expect(html).toContain('border:2px solid');
  });

  it('no deja pasar imágenes que no sean https ni enlaces peligrosos', () => {
    expect(bodyToHtml('![x](http://idesie.com/a.jpg)')).not.toContain('<img');
    expect(bodyToHtml('![x](javascript:alert(1))')).not.toContain('<img');
    expect(bodyToHtml('[[Ver|javascript:alert(1)]]')).not.toContain('<a ');
  });

  it('el texto plano no arrastra la sintaxis', () => {
    const t = bodyToText('# Título\n\n![Aula](https://idesie.com/a.jpg)\n\n---\n\n[[Ver|https://idesie.com|outline]]');
    expect(t).toBe('Título\n\nVer: https://idesie.com');
  });

  it('todas las plantillas de partida se renderizan sin dejar sintaxis a la vista', () => {
    for (const t of STARTER_TEMPLATES) {
      const mail = renderCampaignEmail({ subject: t.subject, body: t.body, recipient: { email: 'a@b.es', name: 'Ana' }, unsubscribeUrl: 'https://x.es/baja?t=1' });
      expect(mail.html).not.toContain('[[');
      expect(mail.html).not.toContain('{{');
      expect(mail.text).not.toContain('[[');
    }
  });
});

describe('seguimiento', () => {
  it('el estado muestra lo más relevante', () => {
    expect(deliveryState(send({ status: 'pending' }))).toBe('queued');
    expect(deliveryState(send())).toBe('sent');
    expect(deliveryState(send({ delivered_at: 'x' }))).toBe('delivered');
    expect(deliveryState(send({ delivered_at: 'x', opened_at: 'x' }))).toBe('opened');
    expect(deliveryState(send({ delivered_at: 'x', opened_at: 'x', clicked_at: 'x' }))).toBe('clicked');
    expect(deliveryState(send({ bounced_at: 'x' }))).toBe('bounced');
    expect(deliveryState(send({ delivered_at: 'x', complained_at: 'x' }))).toBe('complained');
    expect(deliveryState(send({ status: 'failed' }))).toBe('failed');
  });

  it('cuenta personas y un clic implica apertura y entrega', () => {
    const stats = campaignStats([
      send({ delivered_at: 'x' }),
      send({ delivered_at: 'x', opened_at: 'x' }),
      send({ clicked_at: 'x' }), // llegó el clic pero no el aviso de entrega
      send({ bounced_at: 'x' }),
      send({ status: 'failed' }),
      send({ status: 'skipped' }),
    ]);
    expect(stats).toEqual({ sent: 4, delivered: 3, opened: 2, clicked: 1, bounced: 1, complained: 0 });
  });

  it('el porcentaje no divide por cero', () => {
    expect(pct(1, 3)).toBe(33);
    expect(pct(1, 0)).toBe(0);
  });
});
