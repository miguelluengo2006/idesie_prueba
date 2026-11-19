/**
 * Los másteres de IDESIE. Fuente: las páginas de producción de idesie.com (MBIM, MBBE y MBIM Online).
 *
 * Reglas: ningún máster publica precio ni financiación (decisión de la dirección). La certificación Cualificam
 * es exclusiva del MBIM presencial; el MBBE y el MBIM Online otorgan título propio IDESIE.
 */

export type MasterSlug = 'mbim' | 'mbbe' | 'mbim-online';

export interface MasterModule {
  title: string;
  tagline: string;
  /** Fase del recorrido a la que pertenece (agrupa los módulos en la interfaz). */
  phase: string;
  points: string[];
  /** Cómo se usa la IA en este módulo (solo en los másteres que la integran en todas las plantas). */
  ai?: string;
}

export interface MasterLogo {
  name: string;
  src: string;
  width: number;
  height: number;
}

/** Secciones propias del MBIM. Todas opcionales: el resto de másteres no las pintan. */
export interface MasterExtras {
  hero?: { cta: string; secondary: { label: string; href: string } };
  modulesIntro?: {
    title: { pre: string; mark: string; post?: string };
    lead: string;
  };
  aiProof?: {
    eyebrow: string;
    title: { pre: string; mark: string };
    lead: string;
    pillars: { kicker: string; title: string; text: string }[];
    quote: string;
  };
  realProject?: {
    eyebrow: string;
    title: string;
    lead: string;
    name: string;
    specs: { label: string; value: string }[];
    steps: { title: string; text: string }[];
    note: string;
  };
  legacy?: {
    eyebrow: string;
    title: string;
    lead: string;
    logos: MasterLogo[];
    logosCaption: string;
    milestones: { year: string; text: string }[];
  };
  endorsements?: {
    title: string;
    lead: string;
    items: { name: string; text: string; url: string; logo: MasterLogo }[];
    certificate: { src: string; caption: string; verifyUrl: string };
  };
  faculty?: {
    eyebrow: string;
    title: { pre: string; mark: string };
    lead: string;
    people: {
      name: string;
      role: string;
      company: string;
      teaches: string;
      photo?: string;
      linkedin?: string;
    }[];
  };
  profile?: {
    eyebrow: string;
    title: string;
    lead: string;
    skills: { title: string; text: string }[];
    closing: { title: string; text: string; punch: string };
  };
  cta?: { title: string; mark: string; post: string; text: string };
}

export interface Master {
  slug: MasterSlug;
  code: string;
  name: string;
  mode: 'Presencial' | 'Online';
  eyebrow: string;
  headline: { pre: string; mark: string; post?: string };
  lead: string;
  facts: { value: string; label: string }[];
  phases: string[];
  modules: MasterModule[];
  method: {
    title: string;
    lead: string;
    columns: { when: string; title: string; text: string }[];
    steps: { title: string; text: string }[];
  };
  certification: {
    title: string;
    text: string;
    items: { title: string; text: string }[];
  };
  outcomes: {
    title: string;
    stats: { value: string; text: string }[];
    roles: { role: string; focus: string; salary: string }[];
    note: string;
  };
  requirements: string[];
  faqs: { q: string; a: string }[];
  /** La IA dentro de este máster. */
  ai: { kind: 'subject' | 'module'; where: string };
  extras?: MasterExtras;
}

const BIM_ROLES = [
  { role: 'BIM Modeler', focus: 'Modelado y producción', salary: '28.000 – 35.000 €' },
  { role: 'BIM Coordinator', focus: 'Coordinación multidisciplinar', salary: '35.000 – 45.000 €' },
  { role: 'Especialista MEP', focus: 'Instalaciones', salary: '32.000 – 42.000 €' },
  { role: 'Project Manager Junior', focus: 'Gestión de proyecto', salary: '35.000 – 50.000 €' },
];

const BIM_MODULES: MasterModule[] = [
  {
    title: 'Fundamentos BIM',
    tagline: 'Conceptos esenciales, estándares y metodología.',
    phase: 'Fundamentos',
    points: ['Fundamentos de la metodología BIM', 'Trabajo colaborativo en entornos de datos comunes (CDE)', 'Protocolos y estándares internacionales (ISO 19650)'],
  },
  {
    title: 'BIM Design',
    tagline: 'Modelado arquitectónico, estructural y MEP.',
    phase: 'Fundamentos',
    points: [
      'Modelado de arquitectura y estructuras con Revit',
      'Modelado de instalaciones (MEP)',
      'Coordinación de modelos multidisciplinares con Navisworks',
      'Mediciones y presupuestos automatizados',
      'Flujos de diseño colaborativo',
    ],
  },
  {
    title: 'BIM Construction',
    tagline: 'Planificación y control de ejecución con modelos 4D/5D.',
    phase: 'Ejecución',
    points: ['Planificación y control de ejecución con modelos 4D/5D', 'Optimización de recursos, tiempos y costes', 'Coordinación digital en obra'],
  },
  {
    title: 'BIM Civil',
    tagline: 'Infraestructuras y entornos urbanos.',
    phase: 'Ejecución',
    points: ['Diseño y modelado de carreteras, puentes y entornos urbanos con Civil 3D e InfraWorks'],
  },
  {
    title: 'BIM Facility Management',
    tagline: 'Gestión de mantenimiento preventivo.',
    phase: 'Ejecución',
    points: ['Mantenimiento preventivo y predictivo', 'Explotación de modelos digitales en tiempo real durante la vida útil del edificio'],
  },
  {
    title: 'BIM Project Management',
    tagline: 'Gestión integral del proyecto.',
    phase: 'Ejecución',
    points: ['Planes de gerencia y planificación de recursos', 'Cronogramas', 'Control de costes y contratos en proyectos digitales'],
  },
  {
    title: 'Talent',
    tagline: 'Habilidades directivas.',
    phase: 'Liderazgo',
    points: [
      'Comunicación efectiva en entornos multidisciplinares',
      'Gestión de equipos y resolución de conflictos',
      'Estrategia y toma de decisiones',
      'Liderazgo en transformación digital',
    ],
  },
  {
    title: 'Innovation',
    tagline: 'Tecnologías emergentes.',
    phase: 'Liderazgo',
    points: [
      'Análisis de datos: Power BI para visualización y análisis de proyecto',
      'Inteligencia artificial: IA y machine learning aplicados a procesos BIM',
      'Automatización: Dynamo y Python para crear flujos personalizados',
    ],
  },
  {
    title: 'Proyecto Fin de Máster',
    tagline: 'Proyecto integral en BIM.',
    phase: 'Liderazgo',
    points: ['Modelado integral de un proyecto real', 'Coordinación multidisciplinar', 'Planificación y control de costes', 'Presentación y defensa ante tribunal profesional'],
  },
];

/** El MBIM: diez plantas, la primera dedicada a la IA, y la IA en todas las demás sobre el proyecto real del curso. */
const MBIM_MODULES: MasterModule[] = [
  {
    title: 'IA para arquitectos e ingenieros',
    tagline: 'Entender la IA para elegirla bien y construir tus propias herramientas.',
    phase: 'IA',
    points: [
      'Fundamentos de la IA generativa y los modelos de lenguaje, explicados para perfiles AEC',
      'Mapa de soluciones del mercado y criterios para elegir la mejor en cada caso',
      'Prompting, asistentes y flujos de trabajo con IA aplicados a proyectos',
      'Cómo montar tus propios agentes y automatizaciones (Revit + MCP, Claude, ChatGPT, Gemini)',
      'Datos, seguridad y límites: qué delegar en la IA y qué no',
    ],
    ai: 'Entiendes cómo funcionan los modelos de lenguaje y los agentes, comparas las soluciones del mercado con criterio técnico y construyes tus propios flujos (Revit + MCP, automatizaciones). Es la base que aplicas en el resto de módulos.',
  },
  {
    ...BIM_MODULES[0],
    points: [BIM_MODULES[0].points[0], BIM_MODULES[0].points[2], BIM_MODULES[0].points[1]],
    ai: 'Asistentes de IA para redactar y revisar protocolos y requisitos de información (EIR, BEP).',
  },
  {
    ...BIM_MODULES[1],
    ai: 'Modelado en Revit con IA (Revit + MCP) desde cero o a partir de la documentación del Hospital La Laguna.',
  },
  {
    ...BIM_MODULES[2],
    ai: 'IA para generar escenarios de planificación y detectar desviaciones durante la obra, que arranca en octubre de 2026.',
  },
  {
    ...BIM_MODULES[3],
    ai: 'Automatización de trazados y extracción de datos del entorno urbano del proyecto.',
  },
  {
    ...BIM_MODULES[4],
    ai: 'Modelos predictivos de mantenimiento a partir del gemelo digital del hospital.',
  },
  {
    ...BIM_MODULES[5],
    ai: 'IA como apoyo al control de costes, contratos e informes de seguimiento del proyecto real.',
  },
  {
    ...BIM_MODULES[6],
    ai: 'Cómo dirigir equipos que trabajan con IA: qué delegar en la máquina y qué decidir tú.',
  },
  {
    ...BIM_MODULES[7],
    ai: 'Revit + MCP, Claude, ChatGPT, Gemini, generación de imagen y vídeo aplicados al proyecto.',
  },
  {
    ...BIM_MODULES[8],
    ai: 'Tu portfolio: el Hospital La Laguna, modelado, coordinado y planificado con IA, defendido ante profesionales del sector.',
  },
];

const logo = (name: string, file: string, width: number, height: number): MasterLogo => ({ name, src: `/img/mbim/logos/${file}`, width, height });

const MBIM_COMPANY_LOGOS: MasterLogo[] = [
  logo('Ferrovial', 'ferrovial.png', 900, 196),
  logo('Estudio Lamela', 'lamela.png', 400, 48),
  logo('L35 Arquitectos', 'l35.png', 100, 100),
  logo('IDOM', 'idom.png', 600, 215),
  logo('Accenture', 'accenture.png', 600, 167),
  logo('Savills', 'savills.png', 300, 300),
  logo('Tétris', 'tetris.png', 417, 237),
  logo('Lantania', 'lantania.png', 987, 236),
  logo('Hill International', 'hill.png', 900, 599),
  logo('Fenwick Iribarren', 'fenwick.png', 300, 300),
  logo('Valladares Ingeniería', 'valladares.png', 970, 190),
  logo('Daikin', 'daikin.png', 696, 145),
  logo('TROX', 'trox.png', 352, 93),
  logo('Uponor', 'uponor.png', 540, 133),
  logo('Grundfos', 'grundfos.png', 895, 329),
  logo('Philips', 'philips.png', 900, 164),
  logo('Isover', 'isover.png', 900, 275),
  logo('Prysmian', 'prysmian.png', 500, 117),
  logo('Wolf', 'wolf.png', 800, 242),
  logo('Ortiz León Arquitectos', 'ortizleon.png', 276, 63),
  logo('JG Ingenieros', 'jg.png', 324, 95),
];

const VISA_FAQ = {
  q: '¿Necesito visado para estudiar en IDESIE?',
  a: 'Si eres ciudadano no europeo, necesitarás visado de estudiante. Nuestro equipo de admisiones te ayuda con toda la documentación necesaria.',
};

export const MASTERS: Record<MasterSlug, Master> = {
  mbim: {
    slug: 'mbim',
    code: 'MBIM',
    name: 'Máster BIM',
    mode: 'Presencial',
    eyebrow: 'Máster BIM · Presencial en Madrid · 16 meses',
    headline: {
      pre: 'En 2011 creamos el Máster BIM. 15 años después, formamos el perfil que las empresas necesitan:',
      mark: 'el que modela y dirige con IA',
      post: '.',
    },
    lead: 'El Máster BIM más recomendado por las empresas del sector y el primero en España donde la IA no solo revisa: modela en Revit desde cero o a partir de documentación. Trabajas por la mañana, te formas por la tarde y sales preparado para dirigir procesos BIM con IA.',
    facts: [
      { value: '16', label: 'meses de recorrido' },
      { value: '2011', label: 'Año en que creamos el Máster BIM.' },
      {
        value: '15 años',
        label: 'Formando a los profesionales BIM que el sector contrata.',
      },
      { value: '+95 %', label: 'Con empleo a los 6 meses de terminar.' },
      { value: '100 %', label: 'Prácticas remuneradas garantizadas.' },
      {
        value: '1.º',
        label: 'Máster BIM en España donde la IA ya modela en Revit.',
      },
    ],
    phases: ['IA', 'Fundamentos', 'Ejecución', 'Liderazgo'],
    modules: MBIM_MODULES,
    method: {
      title: 'Por la mañana en la empresa. Por la tarde en IDESIE. Desde el primer mes.',
      lead: 'No esperas a acabar para empezar a trabajar. Desde el primer mes haces prácticas remuneradas a media jornada en una empresa del sector y por la tarde te formas con nosotros. Lo que aprendes por la tarde lo aplicas a la mañana siguiente, y la IA está en ambos lados.',
      columns: [
        {
          when: 'Por la mañana',
          title: 'Trabajas',
          text: 'Prácticas remuneradas en un estudio, ingeniería o constructora. Nómina desde el primer mes.',
        },
        {
          when: 'Por la tarde',
          title: 'Te formas',
          text: 'Presencial en Madrid. Proyectos reales, IA en cada proceso, competencias que demuestras.',
        },
      ],
      steps: [
        {
          title: '16 meses',
          text: 'Diez meses de formación con prácticas a media jornada, más seis de prácticas a jornada completa.',
        },
        {
          title: '≈ 11.000 € brutos',
          text: 'Ingresos aproximados durante el máster, abonados cada mes mediante nómina.',
        },
        {
          title: '100 % garantizadas',
          text: 'Prácticas remuneradas en empresas del sector. Certificaciones: Cualificam · AEEN · UDIT · AECOMI.',
        },
      ],
    },
    certification: {
      title: 'Certificaciones y avales',
      text: 'Máster profesional certificado por Cualificam (Fundación para el Conocimiento madri+d), alineado con ISO 19650 y respaldado por AEEN, UDIT y AECOMI.',
      items: [],
    },
    outcomes: {
      title: 'A dónde llegas cuando terminas.',
      stats: [
        {
          value: '95%',
          text: 'de los alumnos consigue empleo en los seis meses posteriores, muchos en la empresa donde hicieron prácticas.',
        },
        {
          value: '100%',
          text: 'de las prácticas están garantizadas y remuneradas: IDESIE asigna la empresa desde el primer mes.',
        },
      ],
      roles: [{ ...BIM_ROLES[0], focus: 'Modelado y producción, ya con IA' }, ...BIM_ROLES.slice(1)],
      note: 'Horquillas de salario bruto anual correspondientes a los perfiles profesionales a los que da acceso el programa.',
    },
    requirements: [
      'Título universitario oficial de Ingeniero, Arquitecto o equivalente',
      'Pasión por la transformación digital del sector AEC mediante BIM e IA',
      'Compromiso con la metodología Learning by Working: mañanas trabajando, tardes estudiando',
      'Nivel de inglés técnico suficiente para documentación BIM internacional',
      'Disponibilidad para asistir presencialmente en Madrid durante 16 meses',
      'Motivación para liderar equipos multidisciplinares en proyectos BIM',
    ],
    faqs: [
      {
        q: '¿Las prácticas están garantizadas o tengo que buscarlas yo?',
        a: 'Las prácticas están garantizadas al 100 %. IDESIE tiene acuerdos con empresas del sector (estudios de arquitectura, ingenierías, constructoras, empresas de facility management) y asigna la empresa según tu perfil, preferencias y rendimiento académico.',
      },
      {
        q: '¿En qué empresas se realizan las prácticas?',
        a: 'IDESIE colabora con estudios de arquitectura, ingenierías, constructoras, empresas de Project Management, fondos y propiedades, tanto españolas como internacionales y de distintos tamaños.',
      },
      {
        q: '¿Qué salidas profesionales tiene este máster?',
        a: 'Podrás trabajar como BIM Modeler, BIM Coordinator, Especialista MEP o Project Manager Junior. Más del 95 % de los alumnos consigue empleo en los 6 meses posteriores, muchos directamente en la empresa donde realizaron prácticas.',
      },
      {
        q: '¿Necesito saber de IA para entrar?',
        a: 'No. El máster incluye un módulo específico de fundamentos de IA para arquitectos e ingenieros, y a partir de ahí la aplicas en todos los demás módulos sobre el proyecto real.',
      },
      {
        q: '¿Dónde está IDESIE?',
        a: 'Nuestro campus está en Madrid, en Plaza de Castilla, una zona bien comunicada con transporte público.',
      },
      {
        q: '¿Puedo visitar la escuela?',
        a: 'Sí, puedes agendar una visita a nuestras instalaciones. Contáctanos para coordinar una fecha que se ajuste a tu disponibilidad.',
      },
      VISA_FAQ,
    ],
    ai: {
      kind: 'subject',
      where: 'Módulo «IA para arquitectos e ingenieros» y la IA en todos los demás módulos',
    },
    extras: {
      hero: {
        cta: 'Quiero ser ese perfil',
        secondary: {
          label: 'Ver el proyecto de este curso',
          href: '#proyecto',
        },
      },
      modulesIntro: {
        title: {
          pre: '10 módulos, una sola obra. Y la IA en',
          mark: 'todas las plantas',
          post: '.',
        },
        lead: 'Cada módulo es una planta más del mismo edificio, de los cimientos al proyecto que defiendes. Este curso, ese edificio es el Hospital La Laguna. La IA no es una asignatura aparte: recorre todas las plantas como la estructura del edificio. Y para que sepas usarla con criterio, el edificio arranca con una planta dedicada a sus fundamentos, antes de empezar con el BIM. Pulsa una planta para ver qué haces en ella.',
      },
      aiProof: {
        eyebrow: 'Prueba, no promesa',
        title: {
          pre: 'El sector usa la IA para revisar. Nosotros la usamos para',
          mark: 'modelar',
        },
        lead: 'En la mayoría de estudios y constructoras la IA sirve para revisar modelos, extraer información o redactar informes. En IDESIE hemos ido un paso más allá: modelamos edificios en Revit con IA, desde cero o a partir de la documentación del proyecto. Y no es una demostración: forma parte de cómo trabajamos cada proceso y protocolo BIM del máster.',
        pillars: [
          {
            kicker: '01 · Modelar',
            title: 'De planos a modelo Revit',
            text: 'Documentación de entrada, modelo Revit de salida. Con IA, a través de Revit + MCP, y con criterio sobre qué se automatiza y qué no.',
          },
          {
            kicker: '02 · Gestionar',
            title: 'Procesos y protocolos con IA',
            text: 'Flujos, protocolos y entregables BIM diseñados y revisados con IA, bajo ISO 19650, de principio a fin.',
          },
          {
            kicker: '03 · Dirigir',
            title: 'Equipos que ya trabajan así',
            text: 'Aprendes a liderar equipos que modelan y validan con IA, decidiendo qué hace la máquina y qué hace la persona.',
          },
        ],
        quote: 'No se puede dirigir lo que no se entiende. Por eso aquí primero lo haces y luego lo gestionas.',
      },
      realProject: {
        eyebrow: 'Proyecto real · Curso 2026-27',
        title: 'No simulas un proyecto. Formas parte de uno.',
        lead: 'Cada promoción se integra en el equipo de diseño y construcción de un proyecto real y participa en todos los procesos BIM, del primer modelo a la entrega de obra. Este curso, el proyecto es el Hospital La Laguna: diseño y construcción, con inicio de obras en octubre de 2026. Lo que modelas, coordinas y planificas con IA en clase es lo que se construye.',
        name: 'Hospital La Laguna',
        specs: [
          { label: 'Alcance', value: 'Diseño y construcción' },
          { label: 'Inicio de obras', value: 'Octubre 2026' },
          {
            label: 'Tu papel',
            value: 'Integrado en el equipo de diseño y construcción',
          },
          { label: 'Procesos', value: 'Todos los procesos BIM, con IA' },
        ],
        steps: [
          {
            title: 'Diseño y modelado',
            text: 'Modelo federado del hospital en Revit, con IA desde la documentación de proyecto.',
          },
          {
            title: 'Coordinación',
            text: 'Disciplinas, interferencias y decisiones con el equipo real de proyecto.',
          },
          {
            title: 'Planificación y obra',
            text: 'Fases, mediciones y seguimiento de ejecución a partir de octubre de 2026.',
          },
          {
            title: 'Entrega',
            text: 'Entregables, protocolos y requisitos de información bajo ISO 19650.',
          },
        ],
        note: 'Es el único máster BIM que desarrolla toda la formación sobre un proyecto real, participando en todos sus procesos.',
      },
      legacy: {
        eyebrow: 'Desde 2011',
        title: 'El Máster BIM nació aquí. Y el sector lo sabe.',
        lead: 'En 2011 creamos el primer Máster BIM de España, cuando casi nadie en el sector hablaba de BIM. Quince años después, nuestros alumnos dirigen departamentos BIM en los estudios, ingenierías y constructoras de referencia, y esas mismas empresas son las que recomiendan el máster a quienes quieren entrar.',
        logos: MBIM_COMPANY_LOGOS,
        logosCaption: 'Empresas que contratan y recomiendan a alumnos de IDESIE.',
        milestones: [
          {
            year: '2011',
            text: 'Creamos el Máster BIM, el primero en España.',
          },
          {
            year: '2023',
            text: 'Certificación Cualificam alineada con ISO 19650, otorgada por la Fundación para el Conocimiento madri+d.',
          },
          {
            year: '2026',
            text: 'Primer máster BIM donde la IA modela en Revit desde cero o a partir de documentación.',
          },
        ],
      },
      endorsements: {
        title: 'Certificaciones y avales',
        lead: 'Un máster propio con reconocimiento externo: certificado como máster profesional y respaldado por las entidades de referencia en escuelas de negocio, universidad y sector.',
        items: [
          {
            name: 'Cualificam',
            text: 'Certificación de Máster Profesional de la Fundación para el Conocimiento madri+d. Alineado con ISO 19650.',
            url: 'https://cualificam.com',
            logo: logo('Cualificam', 'cualificam.png', 800, 183),
          },
          {
            name: 'AEEN',
            text: 'Asociación Española de Escuelas de Negocios.',
            url: 'https://aeen.org',
            logo: logo('AEEN', 'aeen.png', 307, 76),
          },
          {
            name: 'UDIT',
            text: 'Universidad de Diseño, Innovación y Tecnología.',
            url: 'https://udit.es',
            logo: logo('UDIT', 'udit.png', 700, 347),
          },
          {
            name: 'AECOMI',
            text: 'Certificación BIM de AECOMI.',
            url: 'https://aecomi.org',
            logo: logo('AECOMI', 'aecomi.png', 606, 117),
          },
        ],
        certificate: {
          src: '/img/mbim/certificado-cualificam.jpg',
          caption: 'Certificado n.º FMID-CMP23-00020 · Madrid, 1 de marzo de 2024 · Renovación: 01/03/2030',
          verifyUrl: 'https://www.madrimasd.org/universidades/cualificam/cve/3ab6e510-3e5b-454a-bcd2-7ab086aa8a38',
        },
      },
      faculty: {
        eyebrow: 'Quién te forma',
        title: {
          pre: 'Profesionales que dirigen el BIM en el sector.',
          mark: 'No académicos',
        },
        lead: 'Cada profesor trabaja hoy en una empresa de referencia y enseña lo que hace cada día. Lo que ves en clase por la tarde es lo que ellos han aplicado esa misma mañana.',
        people: [
          {
            name: 'José Carlos Martín Mateos',
            role: 'Arquitecto y matemático · Responsable de IA y BIM',
            company: 'L35 Architects',
            teaches: 'Dirección de la IA aplicada: modelado en Revit con IA y protocolos.',
          },
          {
            name: 'Martin Murphy',
            role: 'Director División Calidad y Sistemas',
            company: 'Hill International',
            teaches: 'Gestión BIM y coordinación sobre el proyecto real.',
            photo: '/img/mbim/martin-murphy.jpg',
            linkedin: 'https://www.linkedin.com/in/martin-murphy-2a453129/',
          },
          {
            name: 'Javier López',
            role: 'National Digital Development Lead',
            company: 'SES Engineering Services · Londres',
            teaches: 'Transformación digital y BIM en empresas de ingeniería y construcción.',
            photo: '/img/mbim/javier-lopez.jpg',
            linkedin: 'https://www.linkedin.com/in/javierlopezuk/',
          },
          {
            name: 'Concepción Jerez',
            role: 'Director of Cost Management',
            company: 'Hill International',
            teaches: 'Control de costes y contratación en entorno BIM (5D).',
            photo: '/img/mbim/concepcion-jerez.jpg',
            linkedin: 'https://www.linkedin.com/in/concepci%C3%B3n-jerez-linde-63a30492/',
          },
          {
            name: 'Javier Valladares',
            role: 'Director',
            company: 'Valladares Ingeniería SL',
            teaches: 'Ingeniería de instalaciones (MEP) y coordinación en BIM.',
            photo: '/img/mbim/javier-valladares.jpg',
            linkedin: 'https://www.linkedin.com/in/javier-valladares-81324a11/',
          },
          {
            name: 'Miguel Villamor',
            role: 'General Manager',
            company: 'AEC-ON',
            teaches: 'Tecnología y software BIM: ecosistema de herramientas e interoperabilidad.',
            photo: '/img/mbim/miguel-villamor.jpg',
            linkedin: 'https://www.linkedin.com/in/miguelvillamor/',
          },
        ],
      },
      profile: {
        eyebrow: 'El perfil que las empresas necesitan',
        title: 'Las empresas no buscan modeladores. Buscan a quien sepa dirigir el BIM con IA.',
        lead: 'La IA ya produce modelos, informes y comprobaciones. Lo que escasea es quien sepa diseñar el proceso, fijar el protocolo, validar el resultado y liderar al equipo. Ese es el perfil que formamos: profesionales BIM que entienden la IA porque la han usado para modelar, y que por eso saben dirigirla.',
        skills: [
          {
            title: 'Dirigir',
            text: 'Liderar proyectos y equipos BIM bajo ISO 19650, con la IA integrada en cada fase.',
          },
          {
            title: 'Diseñar procesos',
            text: 'Definir protocolos, flujos y entregables BIM que incorporan IA de principio a fin.',
          },
          {
            title: 'Modelar con IA',
            text: 'Generar modelos Revit desde cero o desde documentación, y saber cuándo conviene hacerlo.',
          },
          {
            title: 'Validar',
            text: 'Revisar, auditar y extraer información de modelos con IA con criterio profesional.',
          },
        ],
        closing: {
          title: 'No te formamos por asignaturas. Te formamos en competencias.',
          text: 'Cada módulo termina cuando sabes hacer algo que antes no sabías y puedes demostrarlo en un proyecto real.',
          punch: 'Por eso no sales con un expediente: sales con un portfolio.',
        },
      },
      cta: {
        title: 'Llevamos 15 años formando a quienes dirigen el BIM.',
        mark: 'Ahora, con IA',
        post: '. El siguiente puedes ser tú.',
        text: 'Plazas limitadas por el número de prácticas remuneradas disponibles. Cuéntanos tu perfil y te decimos con franqueza, en 48 h, si encajas.',
      },
    },
  },

  mbbe: {
    slug: 'mbbe',
    code: 'MBBE',
    name: 'Máster BIM & Building Engineering',
    mode: 'Presencial',
    eyebrow: 'Máster BIM & Building Engineering · Madrid · 16 meses',
    headline: { pre: 'Un edificio son sus instalaciones.', mark: 'Aprende a diseñarlas' },
    lead: 'Especialízate en MEP con metodología BIM: hidráulica, eléctrica, térmica, PCI y renovables. Trabajas por la mañana, te formas por la tarde.',
    facts: [
      { value: '16', label: 'meses de recorrido' },
      { value: '10 + 6', label: 'Diez meses de formación con prácticas a media jornada, más seis de prácticas a jornada completa.' },
      { value: '11.000 €', label: 'Ingresos aproximados durante el programa: 500 € al mes los primeros 10 meses y 1.200 € los 6 siguientes.' },
      { value: '1', label: 'Certificación al terminar: título propio IDESIE.' },
    ],
    phases: ['Técnica', 'Gestión', 'Cierre'],
    modules: [
      {
        title: 'Building Engineering — Instalaciones MEP',
        tagline: 'Dominio completo de todas las instalaciones del edificio.',
        phase: 'Técnica',
        points: ['Arquitectura bioclimática', 'Instalaciones hidráulicas', 'Instalaciones eléctricas', 'Instalaciones térmicas', 'Protección contra incendios', 'Instalaciones especiales', 'Energías alternativas'],
      },
      {
        title: 'BIM — Metodología y herramientas',
        tagline: 'Modelado BIM avanzado con Revit MEP.',
        phase: 'Técnica',
        points: ['Modelado BIM MEP', 'Trabajo colaborativo', 'Organización de proyectos bajo ISO 19650', 'Coordinación con Navisworks y clash detection', 'Estándares y protocolos'],
      },
      {
        title: 'Project Management',
        tagline: 'Gestión integral del proyecto.',
        phase: 'Gestión',
        points: ['Plan de gerencia', 'Planificación', 'Presupuesto y costes', 'Contratación y subcontratas', 'Gestión de riesgos', 'Common Data Environment'],
      },
      {
        title: 'Business Administration',
        tagline: 'Competencias empresariales y liderazgo.',
        phase: 'Gestión',
        points: ['Management skills', 'Estrategia', 'Contabilidad y finanzas', 'Marketing y ventas', 'Recursos humanos'],
      },
      {
        title: 'Proyecto Fin de Máster',
        tagline: 'Proyecto integral MEP en BIM.',
        phase: 'Cierre',
        points: ['Modelado integral de instalaciones MEP', 'Coordinación multidisciplinar con arquitectura y estructura', 'Planificación y control de costes del proyecto', 'Presentación y defensa ante tribunal profesional'],
      },
    ],
    method: {
      title: 'Un día partido en dos. Esa es toda la metodología.',
      lead: 'Aprendes a calcular la instalación por la tarde y la coordinas en un proyecto real a la mañana siguiente.',
      columns: [
        { when: 'Por la mañana', title: 'Trabajas', text: 'Prácticas remuneradas en ingenierías especializadas en MEP, consultoras de instalaciones y departamentos técnicos de constructoras. Desde el primer mes, con contrato.' },
        { when: 'Por la tarde', title: 'Estudias', text: 'Clases presenciales en Madrid con profesionales en activo. Cálculo real de instalaciones y modelado en Revit MEP, no solo manejo de software.' },
      ],
      steps: [
        { title: 'Media jornada', text: 'Desde el inicio y durante 10 meses, prácticas matutinas remuneradas para aplicar lo aprendido.' },
        { title: 'Prácticas a jornada completa', text: 'Al finalizar el máster, prácticas remuneradas adicionales de 6 meses a jornada completa.' },
        { title: 'Inserción laboral', text: 'Incorporación definitiva en empresas colaboradoras del sector AEC gracias a tu amplia experiencia práctica.' },
      ],
    },
    certification: {
      title: 'Título propio IDESIE, alineado con ISO 19650.',
      text: 'El MBBE otorga el título propio de IDESIE, alineado con la norma ISO 19650 que rige la gestión de la información en proyectos BIM. La certificación Cualificam es exclusiva del Máster BIM presencial (MBIM).',
      items: [
        { title: 'Diploma normalizado', text: 'Título propio de IDESIE, con la misma trazabilidad documental que el resto de programas.' },
        { title: 'Reconocimiento oficial', text: 'Posibilidad de homologación por organismos nacionales e internacionales.' },
        { title: 'Garantía de calidad', text: 'Auditoría rigurosa del programa formativo, del profesorado y de los recursos.' },
      ],
    },
    outcomes: {
      title: 'Una de las especializaciones mejor pagadas del sector.',
      stats: [
        { value: '100%', text: 'de empleabilidad: todos nuestros alumni consiguen empleo al terminar el programa.' },
        { value: '100%', text: 'de las prácticas están garantizadas: IDESIE asigna la empresa según tu perfil e intereses.' },
      ],
      roles: [
        { role: 'BIM MEP Modeler', focus: 'Modelado de instalaciones', salary: '30.000 – 38.000 €' },
        { role: 'MEP Coordinator', focus: 'Coordinación multidisciplinar', salary: '38.000 – 50.000 €' },
        { role: 'MEP Manager', focus: 'Dirección técnica', salary: '50.000 – 70.000 €' },
      ],
      note: 'Horquillas de salario bruto anual. La combinación de conocimiento técnico profundo en instalaciones y competencias BIM es escasa en el mercado, y eso se refleja en la retribución.',
    },
    requirements: [
      'Título universitario oficial de Ingeniero, Arquitecto o equivalente',
      'Pasión por la especialización en instalaciones MEP y su impacto en las personas',
      'Compromiso con la metodología Learning by Working (mañanas trabajando, tardes estudiando)',
      'Nivel de inglés técnico suficiente para documentación MEP internacional',
      'Disponibilidad para asistir presencialmente en Madrid durante 16 meses',
      'Responsabilidad y actitud ética hacia el trabajo técnico de calidad',
    ],
    faqs: [
      {
        q: '¿Es necesario saber Revit para acceder al máster?',
        a: 'No, el programa empieza desde cero en Revit MEP. Sí es muy recomendable tener conocimientos de ingeniería de instalaciones, ya que el máster profundiza en cálculo y diseño técnico avanzado, no solo en el manejo del software.',
      },
      {
        q: '¿Qué diferencia hay con el Máster BIM presencial?',
        a: 'El MBBE tiene un enfoque técnico especializado en instalaciones MEP completas: arquitectura bioclimática, hidráulicas, eléctricas, térmicas, PCI, especiales y renovables. Es mucho más profundo en instalaciones que el BIM generalista, e incluye project management y business administration.',
      },
      {
        q: '¿El máster cubre cálculo real de instalaciones o solo modelado BIM?',
        a: 'Ambos en profundidad: cálculo real (secciones eléctricas, caudales hidráulicos, cargas térmicas, PCI, dimensionamiento de renovables) con la normativa vigente, y cómo modelarlo en Revit MEP, coordinar con otras disciplinas y detectar interferencias.',
      },
      {
        q: '¿Las prácticas son en empresas de instalaciones?',
        a: 'Sí: ingenierías especializadas en MEP, consultoras de instalaciones, departamentos técnicos de constructoras, empresas de facility management o estudios de arquitectura con fuerte componente de coordinación de instalaciones.',
      },
      {
        q: '¿Puedo especializarme en una sola disciplina MEP?',
        a: 'El máster cubre todas las disciplinas porque la coordinación efectiva requiere entender cómo interactúan. En el Proyecto Fin de Máster y en las prácticas sí puedes enfocarte en la que más te apasione (eléctrica, climatización, renovables…).',
      },
      VISA_FAQ,
    ],
    ai: { kind: 'subject', where: 'Asignatura «IA aplicada a la Arquitectura»' },
  },

  'mbim-online': {
    slug: 'mbim-online',
    code: 'MBIM Online',
    name: 'Máster BIM Online',
    mode: 'Online',
    eyebrow: 'Máster BIM Online · 100 % remoto · 12 meses',
    headline: { pre: 'El modelo no tiene sede.', mark: 'Tú tampoco deberías' },
    lead: 'Fórmate como BIM Manager desde donde estés, conectado al mismo modelo, a los mismos mentores y a la misma bolsa de empleo que el máster presencial.',
    facts: [
      { value: '12', label: 'meses de programa' },
      { value: '15–20 h', label: 'de dedicación semanal, a tu ritmo' },
      { value: '18', label: 'meses de acceso a los materiales' },
      { value: '1', label: 'Título de Máster BIM de IDESIE' },
    ],
    phases: ['Fundamentos', 'Ejecución', 'Liderazgo'],
    modules: BIM_MODULES,
    method: {
      title: 'Aquí no hay un día correcto.',
      lead: 'El presencial tiene un horario fijo. El online no: esa es la ventaja. Tres alumnos reales, tres semanas completamente distintas.',
      columns: [
        { when: 'Antes del turno', title: 'Delineante en un estudio de arquitectura', text: 'Dos horas cada madrugada, antes de entrar a trabajar.' },
        { when: 'Entre proyectos', title: 'Arquitecta técnica freelance', text: 'Sesiones largas los días sin entregas, ninguna los días con cliente.' },
        { when: 'Otro huso horario', title: 'Ingeniero civil en Latinoamérica', text: 'Clases en directo por la tarde-noche de España, mañana en su país.' },
      ],
      steps: [
        { title: 'Formación 100 % online', text: '12 meses de clases, materiales y sesiones en directo desde cualquier lugar.' },
        { title: 'Tutoría personalizada', text: 'Acompañamiento durante todo el programa y proyecto fin de máster con defensa ante tribunal.' },
        { title: 'Bolsa de empleo', text: 'Acceso completo a la bolsa de empleo de IDESIE y a su red de empresas del sector AEC.' },
      ],
    },
    certification: {
      title: 'El mismo temario, el título de IDESIE.',
      text: 'El Máster BIM Online otorga el título de Máster BIM de IDESIE. La certificación Cualificam es exclusiva del Máster BIM presencial (MBIM) y no está incluida en esta modalidad.',
      items: [
        { title: 'Mismo temario', text: 'Los 9 módulos del máster presencial, pensados para avanzar de forma remota y colaborativa.' },
        { title: 'Sin prácticas remuneradas', text: 'La modalidad online no incluye prácticas remuneradas: sí tienes la bolsa de empleo al terminar.' },
        { title: 'Estándar internacional', text: 'Contenidos alineados con ISO 19650 y trabajo en entornos de datos comunes (CDE).' },
      ],
    },
    outcomes: {
      title: 'A dónde te lleva.',
      stats: [{ value: '=', text: 'Los mismos roles y rangos salariales del sector AEC que el Máster BIM presencial: el mercado de salida es el mismo programa.' }],
      roles: BIM_ROLES,
      note: 'Horquillas de salario bruto anual. La bolsa de empleo te conecta con las oportunidades del sector.',
    },
    requirements: [
      'Se recomienda titulación universitaria en Ingeniería, Arquitectura o equivalente',
      'Conocimientos básicos de AutoCAD (ayudan, pero no son obligatorios)',
      'Entre 15 y 20 horas semanales de dedicación',
    ],
    faqs: [
      { q: '¿El máster es 100 % online?', a: 'Sí. Accedes a clases, materiales y sesiones en directo desde cualquier lugar, adaptando el aprendizaje a tu horario.' },
      { q: '¿Hay prácticas?', a: 'No incluye prácticas remuneradas como el presencial. Sí tienes acceso a la bolsa de empleo de IDESIE para encontrar oportunidades al finalizar.' },
      { q: '¿Tengo acceso a la bolsa de empleo?', a: 'Sí, como alumno tienes acceso completo a la bolsa de empleo de IDESIE y a su red de empresas del sector AEC.' },
      { q: '¿Cuál es la duración del programa?', a: '12 meses, con una dedicación estimada de 15–20 horas semanales. Tienes acceso a los materiales durante 18 meses para repasar a tu ritmo.' },
      { q: '¿Qué certificaciones obtendré?', a: 'El título de Máster BIM de IDESIE. La certificación Cualificam es exclusiva del máster presencial y no está incluida en la modalidad online.' },
      { q: '¿Necesito conocimientos previos?', a: 'Se recomienda titulación universitaria en Ingeniería, Arquitectura o equivalente. Conocimientos básicos de AutoCAD ayudan, pero no son obligatorios.' },
    ],
    ai: { kind: 'module', where: 'Módulo Innovation' },
  },
};

export const MASTER_SLUGS = Object.keys(MASTERS) as MasterSlug[];
export const getMaster = (slug: string): Master | undefined => (MASTERS as Record<string, Master | undefined>)[slug];
