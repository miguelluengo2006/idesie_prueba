import { describe, it, expect } from 'vitest';
import {
  contactStatus,
  contactsToCsv,
  inAudience,
  matchesQuery,
  normalizeTags,
  parseContactsCsv,
  parseCsvRows,
  tagCounts,
  type Contact,
} from '../contacts';

const contact = (over: Partial<Contact> = {}): Contact => ({
  id: '1',
  email: 'ana@empresa.com',
  name: 'Ana Ruiz',
  phone: null,
  company: 'Acme',
  tags: [],
  source: 'manual',
  subscribed: true,
  consent_at: null,
  unsubscribed_at: null,
  notes: null,
  created_at: '2026-10-01T10:00:00Z',
  ...over,
});

describe('estado y audiencia', () => {
  it('distingue suscrito, de baja y sin consentimiento', () => {
    expect(contactStatus({ subscribed: true, unsubscribed_at: null })).toBe('subscribed');
    expect(contactStatus({ subscribed: false, unsubscribed_at: null })).toBe('no-consent');
    expect(contactStatus({ subscribed: true, unsubscribed_at: '2026-10-02T00:00:00Z' })).toBe('unsubscribed');
  });

  it('solo recibe campañas quien está suscrito y no se ha dado de baja', () => {
    expect(inAudience(contact(), [])).toBe(true);
    expect(inAudience(contact({ subscribed: false }), [])).toBe(false);
    expect(inAudience(contact({ unsubscribed_at: '2026-10-02T00:00:00Z' }), [])).toBe(false);
  });

  it('filtra por etiquetas sin distinguir mayúsculas', () => {
    const c = contact({ tags: ['Alumnos', 'BIM'] });
    expect(inAudience(c, ['alumnos'])).toBe(true);
    expect(inAudience(c, ['empresas'])).toBe(false);
    expect(inAudience(c, ['empresas', 'bim'])).toBe(true);
  });
});

describe('etiquetas', () => {
  it('limpia, quita repetidas y vacías', () => {
    expect(normalizeTags(' Alumnos, alumnos ;BIM| ,')).toEqual(['Alumnos', 'BIM']);
    expect(normalizeTags(['<b>x</b>', ''])).toEqual(['bx/b']);
    expect(normalizeTags(42)).toEqual([]);
  });

  it('cuenta las etiquetas en uso', () => {
    const counts = tagCounts([contact({ tags: ['BIM', 'Alumnos'] }), contact({ tags: ['bim'] })]);
    expect(counts).toEqual([
      { tag: 'BIM', count: 2 },
      { tag: 'Alumnos', count: 1 },
    ]);
  });
});

describe('búsqueda', () => {
  it('ignora tildes y mayúsculas y mira también las etiquetas', () => {
    const c = contact({ name: 'María Pérez', tags: ['Máster'] });
    expect(matchesQuery(c, 'maria')).toBe(true);
    expect(matchesQuery(c, 'MASTER')).toBe(true);
    expect(matchesQuery(c, 'acme')).toBe(true);
    expect(matchesQuery(c, 'zzz')).toBe(false);
    expect(matchesQuery(c, '  ')).toBe(true);
  });
});

describe('CSV', () => {
  it('lee comas, punto y coma, comillas y BOM', () => {
    expect(parseCsvRows('﻿a;b;c\n1;"x;y";3\r\n')).toEqual([['a', 'b', 'c'], ['1', 'x;y', '3']]);
    expect(parseCsvRows('a,b\n"he said ""hi""",2')).toEqual([['a', 'b'], ['he said "hi"', '2']]);
    expect(parseCsvRows('a,b\n"línea 1\nlínea 2",x')[1][0]).toBe('línea 1\nlínea 2');
  });

  it('importa por cabeceras en español, descarta inválidos y fusiona repetidos', () => {
    const csv = [
      'Correo;Nombre;Teléfono;Empresa;Etiquetas',
      'ana@empresa.com;Ana Ruiz;600111222;Acme;Alumnos, BIM',
      'no-es-un-email;Pepe;;;',
      'ANA@empresa.com;;;;Máster',
      'luis@x.es;Luis;;;',
    ].join('\n');
    const r = parseContactsCsv(csv);
    expect(r.invalid).toBe(1);
    expect(r.duplicates).toBe(1);
    expect(r.contacts).toEqual([
      { email: 'ana@empresa.com', name: 'Ana Ruiz', phone: '600111222', company: 'Acme', tags: ['Alumnos', 'BIM', 'Máster'] },
      { email: 'luis@x.es', name: 'Luis', phone: '', company: '', tags: [] },
    ]);
  });

  it('sin cabecera asume email, nombre, teléfono, empresa', () => {
    const r = parseContactsCsv('ana@empresa.com,Ana,600111222,Acme\nluis@x.es,Luis');
    expect(r.contacts.map((c) => [c.email, c.name])).toEqual([['ana@empresa.com', 'Ana'], ['luis@x.es', 'Luis']]);
    expect(r.contacts[0].company).toBe('Acme');
  });

  it('un archivo vacío no da contactos', () => {
    expect(parseContactsCsv('')).toEqual({ contacts: [], invalid: 0, duplicates: 0 });
  });

  it('exporta con cabecera, estado y comillas escapadas', () => {
    const csv = contactsToCsv([contact({ company: 'Acme "Pro"', tags: ['A', 'B'] }), contact({ id: '2', email: 'b@x.es', subscribed: false })]);
    const [head, first, second] = csv.split('\n');
    expect(head).toBe('Email,Nombre,Teléfono,Empresa,Etiquetas,Estado,Origen,Alta');
    expect(first).toContain('"Acme ""Pro"""');
    expect(first).toContain('"A, B"');
    expect(first).toContain('"Suscrito"');
    expect(second).toContain('"Sin consentimiento"');
  });
});
