import { describe, it, expect } from 'vitest';
import { MASTERS, MASTER_SLUGS, getMaster } from '../masters';

const strings = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
};

describe('másteres', () => {
  it('hay tres másteres con página y getMaster los encuentra', () => {
    expect(MASTER_SLUGS).toEqual(['mbim', 'mbbe', 'mbim-online']);
    expect(getMaster('mbim')?.code).toBe('MBIM');
    expect(getMaster('no-existe')).toBeUndefined();
  });

  it('el número de módulos es el de idesie.com', () => {
    expect(MASTERS.mbim.modules).toHaveLength(9);
    expect(MASTERS.mbbe.modules).toHaveLength(5);
    expect(MASTERS['mbim-online'].modules).toHaveLength(9);
  });

  it('cada módulo pertenece a una de las fases del máster', () => {
    for (const m of Object.values(MASTERS)) {
      for (const mod of m.modules) expect(m.phases).toContain(mod.phase);
    }
  });

  it('ningún máster publica precio ni financiación', () => {
    for (const m of Object.values(MASTERS)) {
      const text = strings(m).join('\n');
      expect(text).not.toMatch(/cuotas|financiaci|descuento|matr[ií]cula/i);
      expect(text).not.toMatch(/15\.000|3\.800|4\.500/);
    }
  });

  it('solo el MBIM presencial lleva Cualificam; los demás son título propio IDESIE', () => {
    expect(MASTERS.mbim.certification.text).toMatch(/Cualificam/);
    expect(MASTERS.mbbe.certification.title).toMatch(/Título propio IDESIE/);
    expect(MASTERS['mbim-online'].certification.text).toMatch(/no está incluida/);
  });

  it('ningún texto lleva marcadores sin rellenar', () => {
    const bad = strings(MASTERS).filter((s) => /\[[^\]]+\]|\{\{/.test(s));
    expect(bad).toEqual([]);
  });

  it('la IA del online va en el módulo Innovation, que existe en el temario', () => {
    expect(MASTERS['mbim-online'].ai.kind).toBe('module');
    expect(MASTERS['mbim-online'].modules.some((m) => m.title === 'Innovation')).toBe(true);
  });
});
