import { describe, expect, it } from 'vitest';
import { firstName, suggestedIntent, waLink, waMessage, WA_INTENTS } from '../whatsapp';

describe('whatsapp del panel', () => {
  it('sugiere el motivo según la etapa del proceso', () => {
    expect(suggestedIntent('new')).toBe('call');
    expect(suggestedIntent('admission')).toBe('admission');
    expect(suggestedIntent('call')).toBe('reminder');
    expect(suggestedIntent('enrolled')).toBe('enrol');
    expect(suggestedIntent('paid')).toBe('welcome');
    expect(suggestedIntent('lost')).toBe('info');
    expect(suggestedIntent(undefined)).toBe('info');
  });

  it('saluda por el nombre de pila, sin pillar emails ni números', () => {
    expect(firstName('ana LÓPEZ gómez')).toBe('Ana');
    expect(firstName('luis@correo.com')).toBe('');
    expect(firstName('600123456')).toBe('');
    expect(firstName(null)).toBe('');
  });

  it('el mensaje de agendar lleva el calendario de IDESIE y el interés', () => {
    const m = waMessage('call', { name: 'Ana López', interest: 'Máster BIM Full Time' });
    expect(m).toContain('Hola Ana');
    expect(m).toContain('Máster BIM Full Time');
    expect(m).toContain('https://calendly.com/idesie-info/30min');
  });

  it('el recordatorio dice cuándo es la llamada si ya está fijada', () => {
    const m = waMessage('reminder', { name: 'Ana', callAt: '2026-11-03T16:00:00Z' });
    expect(m).toMatch(/martes, 3 de noviembre a las 17:00/);
    expect(waMessage('reminder', { name: 'Ana' })).toContain('calendly.com');
  });

  it('matrícula y bienvenida mencionan la convocatoria y su fecha de inicio', () => {
    const ctx = { name: 'Ana', cohortName: 'Máster BIM 2026', startsAt: '2026-11-16' };
    expect(waMessage('enrol', ctx)).toContain('16 de noviembre de 2026');
    expect(waMessage('welcome', ctx)).toContain('Máster BIM 2026');
    expect(waMessage('enrol', { name: 'Ana' })).not.toMatch(/undefined|null/);
  });

  it('todos los motivos generan texto, salvo el chat en blanco', () => {
    for (const { id } of WA_INTENTS) expect(waMessage(id, { name: 'Ana' }).length > 0).toBe(id !== 'blank');
  });

  it('el enlace añade el prefijo de España y codifica el texto', () => {
    const link = waLink('600 111 222', 'info', { name: 'Ana' })!;
    expect(link.startsWith('https://wa.me/34600111222?text=')).toBe(true);
    expect(decodeURIComponent(link.split('?text=')[1])).toContain('Hola Ana');
    expect(waLink('+34 600 111 222', 'blank')).toBe('https://wa.me/34600111222');
    expect(waLink('12', 'info')).toBeNull();
    expect(waLink(null, 'info')).toBeNull();
  });
});
