/**
 * Catálogo de IDESIE: áreas, microcredenciales y perfiles profesionales.
 * La home y las páginas de perfil leen todo de aquí: cambia un módulo, un ECTS o un precio y se actualiza en todas partes.
 * Los totales de cada perfil (nº de microcredenciales, ECTS, precio) se calculan a partir de sus módulos.
 */

/** Precio por ECTS al contratar módulo a módulo. */
export const PRICE_PER_ECTS = 96;
/** Proyecto fin de máster (simulador profesional). */
export const SIMULATOR_ECTS = 16;
export const MASTER_ECTS = 60;

export const CONTACT = {
  name: 'IDESIE',
  tagline: 'Business & Tech School',
  slogan: 'Proyectamos el futuro de ingenieros y arquitectos',
  address: 'Calle San Aquilino, 13 · 28029 Madrid',
  phone: '+34 91 485 91 32',
  phoneHref: 'tel:+34914859132',
  email: 'info@idesie.com',
  whatsapp: '646 79 90 05',
  whatsappHref: 'https://wa.me/34646799005',
  aecomiUrl: 'https://www.aecomi.org',
  // Calendario donde se elige el día y la hora de la llamada de 30 min
  calendlyUrl: 'https://calendly.com/idesie-info/30min',
} as const;

export type AreaKind = 'Técnica' | 'Transversal';

export interface Area {
  id: string;
  name: string;
  kind: AreaKind;
}

export const AREAS: Area[] = [
  { id: 'fundamentos', name: 'Fundamentos BIM', kind: 'Técnica' },
  { id: 'design', name: 'BIM Design', kind: 'Técnica' },
  { id: 'construction', name: 'BIM Construction', kind: 'Técnica' },
  { id: 'civil', name: 'BIM Civil', kind: 'Técnica' },
  { id: 'pm', name: 'BIM Project Management', kind: 'Técnica' },
  { id: 'fm', name: 'BIM & Facility Management', kind: 'Técnica' },
  { id: 'innovacion', name: 'Innovación', kind: 'Técnica' },
  { id: 'talento', name: 'Talento', kind: 'Transversal' },
];

export interface Micro {
  /** Código de dos cifras (01–23) */
  code: string;
  title: string;
  ects: number;
  area: string;
}

export const MICROS: Micro[] = [
  { code: '01', title: 'Fundamentos de la metodología BIM', ects: 1, area: 'fundamentos' },
  { code: '02', title: 'Protocolos y estándares BIM', ects: 2, area: 'fundamentos' },
  { code: '03', title: 'Trabajo colaborativo. CDE', ects: 2, area: 'fundamentos' },
  { code: '04', title: 'Modelado: arquitectura y estructuras', ects: 3, area: 'design' },
  { code: '05', title: 'Modelado: instalaciones', ects: 3, area: 'design' },
  { code: '06', title: 'Coordinación y revisión de modelos', ects: 1, area: 'design' },
  { code: '07', title: 'Mediciones y presupuestos', ects: 1, area: 'design' },
  { code: '08', title: 'Procesos de diseño', ects: 2, area: 'design' },
  { code: '09', title: 'BIM en fase de construcción', ects: 3, area: 'construction' },
  { code: '10', title: 'Planificación y control de obra', ects: 3, area: 'construction' },
  { code: '11', title: 'Proyectos de infraestructuras con BIM', ects: 1, area: 'civil' },
  { code: '12', title: 'Diseño de infraestructuras (InfraWorks)', ects: 1, area: 'civil' },
  { code: '13', title: 'Ingeniería civil lineal (Civil 3D)', ects: 1, area: 'civil' },
  { code: '14', title: 'Dirección del proyecto. Plan de gerencia', ects: 2, area: 'pm' },
  { code: '15', title: 'Planificación del proyecto', ects: 2, area: 'pm' },
  { code: '16', title: 'Costes del proyecto', ects: 2, area: 'pm' },
  { code: '17', title: 'Facility Management y BIM', ects: 1, area: 'fm' },
  { code: '18', title: 'Automatización con Dynamo', ects: 2, area: 'innovacion' },
  { code: '19', title: 'Python', ects: 2, area: 'innovacion' },
  { code: '20', title: 'Gestión de datos con Power BI', ects: 1, area: 'innovacion' },
  { code: '21', title: 'IA para arquitectura e ingeniería', ects: 2, area: 'innovacion' },
  { code: '22', title: 'Habilidades directivas', ects: 3, area: 'talento' },
  { code: '23', title: 'Fundamentos de dirección estratégica', ects: 3, area: 'talento' },
];

const MICRO_BY_CODE = new Map(MICROS.map((m) => [m.code, m]));

export interface ProfileDef {
  /** Código corto del perfil (se usa en la URL: /perfiles/bdm) */
  code: string;
  name: string;
  /** Si el perfil lo certifica AECOMI */
  certifiable: boolean;
  /** Experiencia que pide la certificación (solo perfiles certificables) */
  experience?: string;
  /** Descripción corta (tarjeta de la home) */
  desc: string;
  /** Descripción ampliada (página del perfil) */
  long?: string;
  /** Códigos de las microcredenciales de su mapa */
  micros: string[];
}

export interface Profile extends ProfileDef {
  microList: Micro[];
  count: number;
  ects: number;
  price: number;
}

const DEFS: ProfileDef[] = [
  {
    code: 'MOD',
    name: 'BIM Modeler',
    certifiable: false,
    desc: 'Produce los modelos de información de arquitectura, estructuras, instalaciones e infraestructuras, y automatiza tareas de modelado.',
    micros: ['01', '02', '03', '04', '05', '12', '13', '18', '19'],
  },
  {
    code: 'COO',
    name: 'BIM Coordinator',
    certifiable: false,
    desc: 'Coordina y revisa los modelos de las distintas disciplinas dentro del entorno colaborativo del proyecto.',
    micros: ['01', '02', '03', '04', '05', '06', '20', '22'],
  },
  {
    code: 'BDM',
    name: 'BIM Design Manager',
    certifiable: true,
    experience: '3+ años en diseño BIM',
    desc: 'Coordina las disciplinas en fase de diseño y audita los modelos digitales y federados.',
    long: 'Coordina las disciplinas en fase de diseño y audita los modelos digitales y federados. Uno de los perfiles más demandados por ingenierías y estudios de arquitectura.',
    micros: ['01', '02', '03', '04', '05', '06', '08', '12', '13', '18', '19', '20', '21', '22'],
  },
  {
    code: 'BCM',
    name: 'BIM Construction Manager',
    certifiable: true,
    experience: '5+ años en construcción BIM',
    desc: 'Implanta BIM en fase de construcción, con control de calidad, planificación 4D, costes y gestión del modelo federado.',
    micros: ['01', '02', '03', '06', '07', '09', '10', '15', '16', '20', '21', '22'],
  },
  {
    code: 'IDM',
    name: 'Information Delivery Manager',
    certifiable: true,
    experience: '3+ años en gestión BIM',
    desc: 'Gestiona estratégicamente la información de los proyectos, supervisa el entorno común de datos y asegura el cumplimiento de ISO 19650.',
    micros: ['01', '02', '03', '14', '22', '23'],
  },
  {
    code: 'BFM',
    name: 'BIM Facility Manager',
    certifiable: false,
    desc: 'Aplica los modelos BIM a la operación y el mantenimiento de edificios y activos inmobiliarios.',
    micros: ['01', '02', '03', '17', '20'],
  },
  {
    code: 'BM',
    name: 'BIM Manager',
    certifiable: false,
    desc: `Dirige la implantación de BIM en proyectos y organizaciones. Su mapa reúne las 23 microcredenciales (44 ECTS); con el simulador profesional como proyecto fin de máster (${SIMULATOR_ECTS} ECTS) completas el Máster BIM de ${MASTER_ECTS} ECTS.`,
    micros: MICROS.map((m) => m.code),
  },
];

export const PROFILES: Profile[] = DEFS.map((def) => {
  const microList = def.micros.map((code) => {
    const m = MICRO_BY_CODE.get(code);
    if (!m) throw new Error(`Microcredencial desconocida en el perfil ${def.code}: ${code}`);
    return m;
  });
  const ects = microList.reduce((sum, m) => sum + m.ects, 0);
  return { ...def, microList, count: microList.length, ects, price: ects * PRICE_PER_ECTS };
});

export const TOTAL_MICROS = MICROS.length;
export const TOTAL_ECTS = MICROS.reduce((sum, m) => sum + m.ects, 0);

export const getProfile = (code: string): Profile | undefined =>
  PROFILES.find((p) => p.code.toLowerCase() === code.toLowerCase());

/** Etiqueta del tipo de perfil (insignia de la tarjeta). */
export function profileBadge(p: Profile): string {
  if (p.certifiable) return 'Certificable AECOMI';
  return p.code === 'BM' ? 'Máster BIM · con proyecto fin de máster' : 'Itinerario formativo';
}

/** Microcredenciales agrupadas por área, solo las áreas que tienen alguno de los módulos dados. */
export function groupByArea(micros: Micro[]): { area: Area; micros: Micro[]; ects: number }[] {
  return AREAS.map((area) => {
    const list = micros.filter((m) => m.area === area.id);
    return { area, micros: list, ects: list.reduce((sum, m) => sum + m.ects, 0) };
  }).filter((g) => g.micros.length > 0);
}

/** 1.632 € — separador de miles a mano: es-ES no agrupa los números de 4 cifras. */
export function formatEuro(n: number): string {
  return `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;
}
