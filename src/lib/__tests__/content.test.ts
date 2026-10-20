import { describe, it, expect } from 'vitest';
import { PRICE_PER_ECTS, SIMULATOR_ECTS } from '../bim';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { AI_EXPERT, AI_MASTER, AI_IN_MASTERS, ALLIANCES, AUDIENCES, COMPANIES, COMPANY_LOGOS, EVENTS, FORMATS, SIMULATOR } from '../content';

const sumEcts = (p: typeof AI_MASTER) => p.blocks.flatMap((b) => b.modules).reduce((s, m) => s + m.ects, 0);

describe('programas de IA', () => {
  it('los ECTS de los módulos suman los del programa', () => {
    expect(sumEcts(AI_MASTER)).toBe(AI_MASTER.ects);
    expect(Math.round(sumEcts(AI_EXPERT) * 10) / 10).toBe(AI_EXPERT.ects);
  });

  it('el precio del programa que no es máster sale de ECTS × precio por ECTS', () => {
    expect(AI_EXPERT.price).toBe(24 * PRICE_PER_ECTS);
    expect(AI_EXPERT.price).toBe(2304);
  });

  it('el bloque I y el bloque II del máster suman 33 y 15 ECTS', () => {
    const [b1, b2] = AI_MASTER.blocks.map((b) => b.modules.reduce((s, m) => s + m.ects, 0));
    expect([b1, b2]).toEqual([33, 15]);
  });

  it('la asignatura de los másteres tiene 8 sesiones repartidas en sus módulos', () => {
    expect(AI_IN_MASTERS.modules.reduce((s, m) => s + m.sessions, 0)).toBe(8);
  });
});

describe('simulador', () => {
  it('cuesta 16 ECTS al precio por ECTS y tiene 7 pasos', () => {
    expect(SIMULATOR.ects).toBe(SIMULATOR_ECTS);
    expect(SIMULATOR.price).toBe(1536);
    expect(SIMULATOR.steps).toHaveLength(7);
  });

  it('no inventa la duración que la propuesta deja por definir', () => {
    expect(SIMULATOR.duration).toBeNull();
  });
});

describe('formatos y huecos', () => {
  it('ningún máster publica precio', () => {
    expect(AI_MASTER.price).toBeUndefined();
    expect(FORMATS.some((f) => 'price' in f)).toBe(false);
  });

  it('las fechas y alcances sin cerrar son null, no texto con corchetes', () => {
    expect(EVENTS.every((e) => e.date === null)).toBe(true);
    expect(ALLIANCES.find((a) => a.name === 'Universidad Panamericana')!.text).toBeNull();
  });

  it('ningún texto lleva marcadores sin rellenar', () => {
    const strings: string[] = [];
    const walk = (v: unknown) => {
      if (typeof v === 'string') strings.push(v);
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk({ FORMATS, AUDIENCES, EVENTS, ALLIANCES, AI_MASTER, AI_EXPERT, SIMULATOR });
    expect(strings.length).toBeGreaterThan(50);
    expect(strings.filter((s) => /\[[^\]]+\]|\{\{/.test(s))).toEqual([]);
  });

  it('las recomendaciones del selector apuntan a rutas que existen', () => {
    const hrefs = new Set(AUDIENCES.flatMap((a) => a.recommendations.map((r) => r.href)));
    expect([...hrefs].sort()).toEqual(['/masters/mbim', '/masters/mbim-online', '/microcredenciales', '/perfiles']);
  });
});

describe('logos de empresas', () => {
  it('hay un logo por empresa, en el mismo orden, y el archivo existe', () => {
    expect(COMPANY_LOGOS.map((l) => l.name)).toEqual([...COMPANIES]);
    for (const l of COMPANY_LOGOS) expect(existsSync(join(process.cwd(), 'public', l.src))).toBe(true);
  });
});
