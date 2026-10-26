import { describe, expect, it } from 'vitest';
import { decodeCsvBytes, identityKeys, parseCsv, parseLeadsCsv } from '../leadsImport';

const META = [
  'id,created_time,ad_name,adset_name,campaign_name,form_name,platform,¿cuándo_quieres_empezar?,email,full_name,phone_number,is_organic',
  'l:111,2026-10-20T09:15:00+02:00,Anuncio A,Conjunto 1,Máster BIM oct,Formulario máster,fb,en_1-3_meses,Ana@Correo.com,Ana López,p:+34600111222,false',
  'l:222,2026-10-21T18:00:00+02:00,Anuncio A,Conjunto 1,Máster BIM oct,Formulario máster,ig,lo_antes_posible,,Luis Gómez,p:+34 611 222 333,false',
  'l:333,2026-10-21T19:00:00+02:00,Anuncio A,Conjunto 1,Máster BIM oct,Formulario máster,ig,,,Sin Datos,,false',
].join('\n');

describe('lector de CSV', () => {
  it('respeta comillas, comillas escapadas y saltos de línea dentro de una celda', () => {
    expect(parseCsv('a,b\n"x, y","di ""hola""\nadiós"')).toEqual([['a', 'b'], ['x, y', 'di "hola"\nadiós']]);
  });

  it('detecta el separador (coma, punto y coma o tabulador) y salta líneas vacías', () => {
    expect(parseCsv('a;b\n1;2\n\n3;4\n')).toEqual([['a', 'b'], ['1', '2'], ['3', '4']]);
    expect(parseCsv('a\tb\n1\t2')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('decodifica UTF-8 con BOM y UTF-16 con tabuladores (Administrador de anuncios)', () => {
    const utf8 = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode('á,b')]);
    expect(decodeCsvBytes(utf8.buffer)).toBe('á,b');
    const text = 'nombre\tmóvil';
    const utf16 = new Uint8Array(2 + text.length * 2);
    utf16.set([0xff, 0xfe]);
    for (let i = 0; i < text.length; i++) {
      utf16[2 + i * 2] = text.charCodeAt(i) & 0xff;
      utf16[3 + i * 2] = text.charCodeAt(i) >> 8;
    }
    expect(decodeCsvBytes(utf16.buffer)).toBe(text);
  });
});

describe('leads de Meta', () => {
  const result = parseLeadsCsv(META);

  it('lee los datos de contacto y quita los prefijos de Meta', () => {
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toMatchObject({ name: 'Ana López', email: 'ana@correo.com', phone: '+34600111222', campaign: 'Máster BIM oct', adset: 'Conjunto 1', ad: 'Anuncio A', form: 'Formulario máster', platform: 'fb' });
    expect(result.rows[1]).toMatchObject({ name: 'Luis Gómez', email: '', phone: '+34 611 222 333' });
  });

  it('omite las filas sin email ni teléfono y lo cuenta', () => {
    expect(result.skipped).toBe(1);
  });

  it('guarda las respuestas del formulario como «pregunta: respuesta» y no las columnas internas de Meta', () => {
    expect(result.rows[0].extra).toEqual(['¿cuándo quieres empezar?: en 1-3 meses']);
    expect(result.rows[0].extra.join()).not.toMatch(/is organic|false|l:111/);
    // sin respuesta, no hay línea vacía
    expect(parseLeadsCsv(META.replace('lo_antes_posible', '')).rows[1].extra).toEqual([]);
  });

  it('convierte la fecha de creación y descarta las que no tienen sentido', () => {
    expect(result.rows[0].createdAt).toBe('2026-10-20T07:15:00.000Z');
    const bad = parseLeadsCsv('created_time,email\nno es fecha,a@b.com\n1999-01-01,c@d.com');
    expect(bad.rows.map((r) => r.createdAt)).toEqual(['', '']);
  });

  it('entiende las columnas en español y nombre + apellidos por separado', () => {
    const r = parseLeadsCsv('nombre_de_pila;apellidos;correo electrónico;teléfono\nMarta;Ruiz;marta@x.es;600000000');
    expect(r.rows[0]).toMatchObject({ name: 'Marta Ruiz', email: 'marta@x.es', phone: '600000000' });
  });

  it('un archivo sin filas o sin columnas conocidas no devuelve leads', () => {
    expect(parseLeadsCsv('').rows).toEqual([]);
    expect(parseLeadsCsv('foo,bar\n1,2').rows).toEqual([]);
  });

  it('lista las columnas reconocidas para enseñarlas antes de importar', () => {
    expect(result.recognized).toEqual(expect.arrayContaining(['Nombre', 'Email', 'Teléfono', 'Campaña', 'Fecha']));
    expect(result.recognized.some((r) => /pregunta/.test(r))).toBe(true);
  });
});

describe('misma persona', () => {
  it('se reconoce por email en minúsculas o por las últimas 9 cifras del teléfono', () => {
    expect(identityKeys({ email: ' Ana@X.com ', phone: '+34 600 111 222' })).toEqual(['e:ana@x.com', 'p:600111222']);
    expect(identityKeys({ email: '', phone: '123' })).toEqual([]);
  });
});
