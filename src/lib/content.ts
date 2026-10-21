/**
 * Contenido de las páginas públicas que no vive en `bim.ts` (que es el catálogo: perfiles y microcredenciales).
 * Fuente: propuestas de la nueva web (`contenido /2026`) y el modelo de servicios de IDESIE.
 *
 * Regla: un dato que la propuesta deja sin cerrar ([Fecha], «por definir») es `null` aquí, y la interfaz
 * lo muestra como «Próximamente». Nunca se rellena con un valor inventado.
 */
import { MASTER_ECTS, PRICE_PER_ECTS, SIMULATOR_ECTS, TOTAL_MICROS } from './bim';

/** Cifras de la escuela, en un solo sitio para que toda la web diga lo mismo. */
export const FACTS = {
  /** Confirmado por la dirección (el modelo de servicios decía 2011). */
  founded: 2012,
  /** Confirmado por la dirección: más de 3.600 alumnos formados. */
  students: '3.600+',
  placement: '100%',
  companies: '~50',
  /** Fuente de las cifras: Business Plan de IDESIE, septiembre de 2024. */
  source: 'Business Plan IDESIE, septiembre de 2024',
} as const;

// ─── Los tres formatos ────────────────────────────────────────────────────────

export interface Format {
  id: 'blended' | 'online' | 'micros';
  name: string;
  audience: string;
  how: string;
  employment: string;
}

export const FORMATS: Format[] = [
  {
    id: 'blended',
    name: 'Máster blended',
    audience: 'Recién titulados y jóvenes profesionales',
    how: '50% presencial con casos reales, 50% online',
    employment: 'Trabajo en empresa desde el primer día',
  },
  {
    id: 'online',
    name: 'Máster online',
    audience: 'Profesionales que necesitan flexibilidad',
    how: '100% online, con los recursos del presencial',
    employment: 'Bolsa de empleo',
  },
  {
    id: 'micros',
    name: 'Microcredenciales',
    audience: 'Profesionales en activo',
    how: `${TOTAL_MICROS} módulos de 1–3 ECTS, a su ritmo`,
    employment: 'Acumulables hasta completar el máster',
  },
];

// ─── «¿En qué momento profesional estás?» ─────────────────────────────────────

export interface Audience {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  recommendations: { title: string; text: string; href: string }[];
}

export const AUDIENCES: Audience[] = [
  {
    id: 'recien-titulado',
    title: 'Recién titulado sin experiencia',
    subtitle: 'Acabas de terminar el grado',
    text: 'Necesitas tu primera experiencia profesional. El máster presencial con metodología dual te forma y te pone a trabajar en empresa desde el primer día.',
    recommendations: [{ title: 'Máster presencial · Learning by Working', text: 'Formación y trabajo remunerado en empresa.', href: '/masters/mbim' }],
  },
  {
    id: 'menor-30-salto',
    title: 'Menor de 30, buscando dar el salto',
    subtitle: 'Menos de 5 años de experiencia, sin trabajo o con ganas de proyectarte',
    text: 'Quieres proyectarte profesionalmente. Combina la metodología dual con el mapa del perfil al que aspiras.',
    recommendations: [
      { title: 'Máster presencial · Learning by Working', text: 'Formación y trabajo en empresa desde el primer día.', href: '/masters/mbim' },
      { title: 'Perfiles profesionales', text: 'El mapa de competencias del puesto que buscas.', href: '/perfiles' },
    ],
  },
  {
    id: 'menor-30-creciendo',
    title: 'Menor de 30, creciendo en tu empresa',
    subtitle: 'Tienes trabajo y quieres seguir avanzando',
    text: 'Compatibiliza la formación con tu trabajo y suma las competencias que te piden para crecer.',
    recommendations: [
      { title: 'Máster online', text: `${MASTER_ECTS} ECTS a tu ritmo.`, href: '/masters/mbim-online' },
      { title: 'Perfiles profesionales', text: 'Tu ruta hacia el siguiente puesto.', href: '/perfiles' },
      { title: 'Microcredenciales', text: `Solo las competencias que te faltan · ${PRICE_PER_ECTS} € por ECTS.`, href: '/microcredenciales' },
    ],
  },
  {
    id: 'mas-5-anos',
    title: 'Profesional con más de 5 años',
    subtitle: 'Más de 30 años, a por tu siguiente paso',
    text: 'Acredita lo que ya sabes hacer y completa las competencias para crecer en tu empresa o dar un salto profesional.',
    recommendations: [
      { title: 'Máster online', text: `${MASTER_ECTS} ECTS a tu ritmo.`, href: '/masters/mbim-online' },
      { title: 'Perfiles profesionales', text: 'Camino hacia la certificación profesional.', href: '/perfiles' },
      { title: 'Microcredenciales', text: `Formación a medida · ${PRICE_PER_ECTS} € por ECTS.`, href: '/microcredenciales' },
    ],
  },
];

// ─── Simulador profesional ────────────────────────────────────────────────────

export const SIMULATOR = {
  ects: SIMULATOR_ECTS,
  price: SIMULATOR_ECTS * PRICE_PER_ECTS,
  /** La propuesta dice «por definir». */
  duration: null as string | null,
  steps: [
    'Requisitos del cliente',
    'Plan de ejecución BIM',
    'Entregas a cliente',
    'Seguimiento y control',
    'Cambios e incidencias',
    'Auditoría',
    'Entrega final y defensa',
  ],
  /** Texto obligatorio junto a cualquier mención de que el simulador convalida experiencia. */
  convalidationNote: 'Según los criterios del esquema de certificación de AECOMI para cada perfil.',
} as const;

// ─── Inteligencia artificial ──────────────────────────────────────────────────

export interface AiModule {
  code: string;
  title: string;
  ects: number;
}

export interface AiProgram {
  id: 'master' | 'experto';
  name: string;
  tagline: string;
  ects: number;
  hours: number;
  months: number;
  weeks: number;
  hoursPerWeek: number;
  sessions: string;
  /** Solo los programas que no son un máster llevan precio publicado: la dirección pidió no mostrar ninguno de máster. */
  price?: number;
  blocks: { title: string; modules: AiModule[] }[];
  /** Entregable final. */
  result: string;
  audience?: string;
}

const aiPrice = (ects: number) => Math.round(ects * PRICE_PER_ECTS);

export const AI_START = 'Febrero de 2027';

export const AI_MASTER: AiProgram = {
  id: 'master',
  name: 'Máster en IA aplicada a la Arquitectura',
  tagline: 'Del estudio previo a la operación del edificio.',
  ects: 60,
  hours: 1500,
  months: 9,
  weeks: 40,
  hoursPerWeek: 12,
  sessions: '4 sesiones de 3 h',
  blocks: [
    {
      title: 'Bloque I · IA aplicada al proyecto arquitectónico',
      modules: [
        { code: 'M0', title: 'Introducción a la IA y Prompt Engineering', ects: 2 },
        { code: 'M1', title: 'Estudios previos y Due Diligence', ects: 4 },
        { code: 'M2', title: 'Anteproyecto: imagen y vídeo con IA', ects: 5 },
        { code: 'M3', title: 'Proyecto Básico y normativa', ects: 5 },
        { code: 'M4', title: 'Proyecto de Ejecución: IA + BIM + agentes', ects: 8 },
        { code: 'M5', title: 'Fase de obra: actas, SS, Libro del Edificio', ects: 5 },
        { code: 'M6', title: 'Operación y mantenimiento', ects: 4 },
      ],
    },
    {
      title: 'Bloque II · Implantación en el estudio',
      modules: [
        { code: 'M7', title: 'Estrategia IA, AI Manager y gestión del cambio', ects: 5 },
        { code: 'M8', title: 'Datos, RAG, agentes y automatización', ects: 6 },
        { code: 'M9', title: 'Gobernanza, legal, ética y evaluación', ects: 4 },
      ],
    },
    { title: 'Trabajo final', modules: [{ code: 'TFM', title: 'Proyecto propio con IA + Plan de Implantación', ects: 12 }] },
  ],
  result: 'Doble entregable final: un proyecto propio resuelto con IA de principio a fin y un Plan de Implantación de IA para un estudio.',
};

export const AI_EXPERT: AiProgram = {
  id: 'experto',
  name: 'Programa Experto en Implantación de la IA',
  tagline: 'Del BIM Manager al AI Manager.',
  ects: 24,
  hours: 600,
  months: 6,
  weeks: 26,
  hoursPerWeek: 9,
  sessions: '3 sesiones de 3 h',
  price: aiPrice(24),
  blocks: [
    {
      title: 'Programa · 9 módulos',
      modules: [
        { code: 'M1', title: 'Estrategia de IA y el rol del AI Manager', ects: 2.4 },
        { code: 'M2', title: 'Gobernanza del dato y documentación IA-ready', ects: 3 },
        { code: 'M3', title: 'Arquitectura técnica de soluciones IA', ects: 3 },
        { code: 'M4', title: 'Gobernanza de datos BIM e IA', ects: 3.6 },
        { code: 'M5', title: 'Automatización de procesos internos', ects: 3 },
        { code: 'M6', title: 'Legal, ética, propiedad intelectual y regulación', ects: 2.4 },
        { code: 'M7', title: 'Evaluación, calidad y métricas de sistemas IA', ects: 2.4 },
        { code: 'M8', title: 'Gestión del cambio y formación interna', ects: 1.8 },
        { code: 'M9', title: 'Plan de Implantación IA integrado', ects: 2.4 },
      ],
    },
  ],
  result: 'Un Plan de Implantación de IA completo y un prototipo funcional, defendidos ante un panel simulado de dirección.',
  audience: 'BIM Managers, coordinadores BIM, project managers y responsables de innovación de estudios AECO.',
};

/** Las seis fases del proyecto en las que la IA ya forma parte de los programas. */
export const AI_PHASES = [
  { title: 'Estudios previos', tool: 'Due Diligence asistida' },
  { title: 'Anteproyecto', tool: 'Imagen y vídeo con IA' },
  { title: 'Proyecto Básico', tool: 'Normativa con trazabilidad' },
  { title: 'Ejecución BIM', tool: 'Agentes en Revit' },
  { title: 'Obra', tool: 'Actas y documentación' },
  { title: 'Operación', tool: 'Asistente de mantenimiento' },
] as const;

/** Nivel 1: asignatura obligatoria en los másteres MBIM y MBBE. */
export const AI_IN_MASTERS = {
  name: 'IA aplicada a la Arquitectura',
  ects: 2,
  sessions: '8 sesiones presenciales de 4,5 horas',
  modules: [
    { title: 'Introducción a la IA', sessions: 1 },
    { title: 'Prompting profesional y asistentes documentales', sessions: 2 },
    { title: 'Generación y edición de imágenes y vídeo', sessions: 2 },
    { title: 'IA + BIM: Revit, agentes y copilotos', sessions: 3 },
  ],
} as const;

export const AI_TOOLS = [
  { kind: 'Texto', tools: 'Claude · ChatGPT · Gemini · Perplexity' },
  { kind: 'Imagen', tools: 'Midjourney · Nano Banana · GPT Image · Flux' },
  { kind: 'Vídeo', tools: 'Veo · Kling · Runway' },
  { kind: 'BIM', tools: 'Revit + MCP · Dynamo · Python' },
  { kind: 'Automatización', tools: 'n8n · no-code / low-code' },
  { kind: 'Apps', tools: 'Lovable · Bolt · v0 · Replit' },
] as const;

export const AI_DIRECTOR = {
  name: 'José Carlos Martín Mateos',
  role: 'Arquitecto y matemático. Responsable de IA y BIM en L35 Architects.',
} as const;

// ─── Prueba social ────────────────────────────────────────────────────────────

export const ALUMNI = [
  { name: 'Inés Azpeitia', role: 'BIM Manager', where: 'Ferrovial Construction · Madrid' },
  { name: 'Juan Martínez Carrillo', role: 'BIM Manager', where: 'Webuild · Noruega' },
  { name: 'Cristina Santos Rubio', role: 'Digital Lead · Building Engineering', where: 'AECOM · Madrid' },
  { name: 'Javier López', role: 'Senior Digital Construction Manager', where: 'Sir Robert McAlpine · Londres' },
] as const;

export const COMPANIES = [
  'L35 Arquitectos',
  'Estudio Lamela',
  'Fenwick Iribarren',
  'IDOM',
  'Valladares Ingeniería',
  'JG Ingenieros',
  'Ferrovial',
  'Lantania',
  'Hill International',
  'Tétris (Grupo JLL)',
  'Accenture',
  'EY',
  'Schneider Electric',
  'Daikin',
  'TROX',
] as const;

/**
 * Logotipos de las empresas, en el mismo orden que `COMPANIES`. Archivos en `public/img/logos`: los vectoriales vienen de
 * Wikimedia Commons (dominio público) o de la propia web de cada empresa; `width`/`height` es su proporción.
 */
export const COMPANY_LOGOS = [
  { name: 'L35 Arquitectos', file: 'l35.svg', width: 305, height: 177 },
  { name: 'Estudio Lamela', file: 'lamela.svg', width: 263, height: 37 },
  { name: 'Fenwick Iribarren', file: 'fenwick.svg', width: 1000, height: 37 },
  { name: 'IDOM', file: 'idom.png', width: 283, height: 65 },
  { name: 'Valladares Ingeniería', file: 'valladares.svg', width: 205, height: 55 },
  { name: 'JG Ingenieros', file: 'jg.png', width: 326, height: 96 },
  { name: 'Ferrovial', file: 'ferrovial.svg', width: 480, height: 105 },
  { name: 'Lantania', file: 'lantania.jpg', width: 718, height: 305 },
  { name: 'Hill International', file: 'hill.svg', width: 571, height: 175 },
  { name: 'Tétris (Grupo JLL)', file: 'tetris.png', width: 467, height: 520 },
  { name: 'Accenture', file: 'accenture.svg', width: 204, height: 56 },
  { name: 'EY', file: 'ey.svg', width: 479, height: 556 },
  { name: 'Schneider Electric', file: 'schneider.svg', width: 957, height: 436 },
  { name: 'Daikin', file: 'daikin.svg', width: 300, height: 65 },
  { name: 'TROX', file: 'trox.svg', width: 900, height: 220 },
].map((l) => ({ ...l, src: `/img/logos/${l.file}` }));

export interface Alliance {
  kind: string;
  name: string;
  where: string;
  /** `null` = alcance sin cerrar («Próximamente»). */
  text: string | null;
}

export const ALLIANCES: Alliance[] = [
  {
    kind: 'Certificación universitaria',
    name: 'UTAMED',
    where: 'España',
    text: 'Universidad Tecnológica Atlántico-Mediterráneo. Certifica nuestros másteres, microcredenciales y perfiles profesionales.',
  },
  { kind: 'Alianza académica', name: 'Universidad Panamericana', where: 'México', text: null },
  {
    kind: 'Certificación profesional',
    name: 'AECOMI',
    where: 'Internacional',
    text: 'Certifica de forma independiente los perfiles profesionales del sector AECO.',
  },
];

export interface AgendaEvent {
  title: string;
  mode: string;
  /** `null` = fecha por confirmar («Próximamente»). */
  date: string | null;
}

export const EVENTS: AgendaEvent[] = [
  { title: 'Sesión informativa · Máster BIM', mode: 'Presencial · Madrid', date: null },
  { title: 'Webinar · Cómo certificar tu perfil profesional', mode: 'Online', date: null },
  { title: 'Presentación del simulador profesional', mode: 'Presencial y online', date: null },
];

// ─── Fotografías propias (public/img) ─────────────────────────────────────────

export interface Photo {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export const PHOTOS = {
  clase: { src: '/img/clase-alumnos.webp', width: 2000, height: 1143, alt: 'Alumnos trabajando con sus portátiles en una clase de IDESIE' },
  tableta: { src: '/img/trabajo-tableta-hd.webp', width: 1800, height: 1350, alt: 'Manos de un equipo revisando planos y datos en una tableta' },
  aula: { src: '/img/aula-profesor-hd.webp', width: 1800, height: 1208, alt: 'Un profesor imparte clase a alumnos con portátiles de IDESIE' },
  auditorio: { src: '/img/alumnos-grupo.webp', width: 1536, height: 1024, alt: 'Grupo de alumnos de IDESIE con sus libros de BIM' },
  reunion: { src: '/img/reunion-equipo-hd.webp', width: 1536, height: 994, alt: 'Profesionales reunidos en torno a una mesa de trabajo con una maqueta BIM en el portátil' },
} satisfies Record<string, Photo>;
