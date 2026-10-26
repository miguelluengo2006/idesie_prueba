import { describe, expect, it } from 'vitest';
import { leadChannel, leadInterest, leadNote, statusMeta, statusOptions } from '../../components/portal/leadMeta';

describe('lead en el panel', () => {
  it('saca el interés de la respuesta o, si no, de la línea «Interés:»', () => {
    expect(leadInterest({ answers: { needs: ['Máster BIM · online'] }, message: '' })).toBe('Máster BIM · online');
    expect(leadInterest({ answers: null, message: 'Interés: Máster BIM · presencial\nOrigen: /landing' })).toBe('Máster BIM · presencial');
    expect(leadInterest({ answers: null, message: 'Hola, quiero info' })).toBeNull();
  });

  it('distingue landing, web, llamada y manual, con la campaña si la hay', () => {
    expect(leadChannel({ source: 'landing', kind: 'proposal', answers: { utm: { utm_source: 'meta', utm_campaign: 'oct' } } })).toEqual({ label: 'Landing', campaign: 'oct' });
    expect(leadChannel({ source: 'landing', kind: 'proposal', answers: { utm: { utm_source: 'meta' } } }).campaign).toBe('meta');
    expect(leadChannel({ source: 'website', kind: 'call', answers: null })).toEqual({ label: 'Web · llamada', campaign: null });
    expect(leadChannel({ source: 'website', kind: 'proposal', answers: null }).label).toBe('Web');
    expect(leadChannel({ source: 'manual', kind: 'proposal', answers: null }).label).toBe('Manual');
    expect(leadChannel({ source: 'facebook', kind: 'proposal', answers: { utm: { utm_source: 'facebook', utm_campaign: 'Máster BIM oct' } } })).toEqual({ label: 'Facebook', campaign: 'Máster BIM oct' });
  });

  it('quita del comentario las líneas que añade la web', () => {
    expect(leadNote('Interés: Máster BIM\nOrigen: /landing')).toBe('');
    expect(leadNote('Sin comentarios adicionales.')).toBe('');
    expect(leadNote('Interés: X\nTrabajo en una constructora')).toBe('Trabajo en una constructora');
    expect(leadNote(null)).toBe('');
  });

  it('ofrece las etapas del embudo en orden y con el mismo nombre para solicitudes y llamadas', () => {
    expect(statusOptions('proposal').map((o) => o.label)).toEqual(['Nuevo', 'Contactado', 'Admisión', 'Llamada', 'Seguimiento', 'Matriculado', 'Pagado', 'Descartado']);
    expect(statusOptions('call')).toEqual(statusOptions('proposal'));
    expect(statusMeta('paid', 'call').label).toBe('Pagado');
  });
});
