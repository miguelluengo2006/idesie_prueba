import { describe, expect, it } from 'vitest';
import { calendlyUrl, isCalendlyScheduled } from '../calendly';

describe('calendario de las llamadas', () => {
  it('apunta al calendario de IDESIE', () => {
    expect(calendlyUrl()).toBe('https://calendly.com/idesie-info/30min');
  });

  it('rellena nombre y email para que no los escriba dos veces', () => {
    const url = new URL(calendlyUrl({ name: 'Ana López', email: 'ana@correo.com' }));
    expect(url.searchParams.get('name')).toBe('Ana López');
    expect(url.searchParams.get('email')).toBe('ana@correo.com');
    expect(url.searchParams.has('embed_domain')).toBe(false);
  });

  it('en modo incrustado lleva el dominio de la web', () => {
    const url = new URL(calendlyUrl({ embedDomain: 'idesie.com' }));
    expect(url.searchParams.get('embed_domain')).toBe('idesie.com');
    expect(url.searchParams.get('embed_type')).toBe('Inline');
  });

  it('solo se fía del aviso de «reserva hecha» que llega desde Calendly', () => {
    expect(isCalendlyScheduled('https://calendly.com', { event: 'calendly.event_scheduled' })).toBe(true);
    expect(isCalendlyScheduled('https://calendly.com', { event: 'calendly.date_and_time_selected' })).toBe(false);
    expect(isCalendlyScheduled('https://evil.example', { event: 'calendly.event_scheduled' })).toBe(false);
    expect(isCalendlyScheduled('https://calendly.com', null)).toBe(false);
    expect(isCalendlyScheduled('https://calendly.com', 'calendly.event_scheduled')).toBe(false);
  });
});
