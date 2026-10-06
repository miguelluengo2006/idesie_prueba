import { describe, it, expect } from 'vitest';
import {
  AREAS,
  MASTER_PRICE_PARTS,
  MICROS,
  PROFILES,
  TOTAL_ECTS,
  TOTAL_MICROS,
  formatEuro,
  getProfile,
  groupByArea,
} from '../bim';

// Cifras publicadas en la propuesta de la web y en el nuevo modelo de servicios
const EXPECTED: Record<string, { count: number; ects: number; price: string }> = {
  MOD: { count: 9, ects: 17, price: '1.632 €' },
  COO: { count: 8, ects: 16, price: '1.536 €' },
  BDM: { count: 14, ects: 26, price: '2.496 €' },
  BCM: { count: 12, ects: 23, price: '2.208 €' },
  IDM: { count: 6, ects: 13, price: '1.248 €' },
  BFM: { count: 5, ects: 7, price: '672 €' },
  BM: { count: 23, ects: 44, price: '4.224 €' },
};

describe('catálogo BIM', () => {
  it('tiene 23 microcredenciales que suman 44 ECTS', () => {
    expect(TOTAL_MICROS).toBe(23);
    expect(TOTAL_ECTS).toBe(44);
    expect(new Set(MICROS.map((m) => m.code)).size).toBe(23);
  });

  it('el máster completo por partes cuesta 5.760 €', () => {
    expect(MASTER_PRICE_PARTS).toBe(5760);
  });

  it.each(Object.entries(EXPECTED))('el perfil %s coincide con las cifras publicadas', (code, exp) => {
    const p = getProfile(code)!;
    expect(p.count).toBe(exp.count);
    expect(p.ects).toBe(exp.ects);
    expect(formatEuro(p.price)).toBe(exp.price);
  });

  it('cada microcredencial pertenece a un área existente', () => {
    const ids = new Set(AREAS.map((a) => a.id));
    expect(MICROS.every((m) => ids.has(m.area))).toBe(true);
  });

  it('los perfiles certificables son IDM, BDM y BCM', () => {
    expect(PROFILES.filter((p) => p.certifiable).map((p) => p.code).sort()).toEqual(['BCM', 'BDM', 'IDM']);
  });

  it('agrupa por área con los ECTS de cada una (BIM Design Manager)', () => {
    const groups = groupByArea(getProfile('bdm')!.microList);
    expect(groups.map((g) => [g.area.name, g.ects])).toEqual([
      ['Fundamentos BIM', 5],
      ['BIM Design', 9],
      ['BIM Civil', 2],
      ['Innovación', 7],
      ['Talento', 3],
    ]);
  });

  it('formatea euros con separador de miles', () => {
    expect(formatEuro(4800)).toBe('4.800 €');
    expect(formatEuro(96)).toBe('96 €');
    expect(formatEuro(5760)).toBe('5.760 €');
  });
});
