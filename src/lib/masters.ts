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
  certification: { title: string; text: string; items: { title: string; text: string }[] };
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
    headline: { pre: 'El sector ya construye en digital.', mark: 'Aprende a dirigirlo' },
    lead: 'Trabajas por la mañana, te formas por la tarde y sales siendo BIM Manager. Con prácticas remuneradas garantizadas desde el primer mes.',
    facts: [
      { value: '16', label: 'meses de recorrido' },
      { value: '10 + 6', label: 'Diez meses de formación con prácticas a media jornada, más seis de prácticas a jornada completa.' },
      { value: '11.000 €', label: 'Ingresos aproximados mientras estudias, abonados mensualmente mediante nómina.' },
      { value: '2', label: 'Certificaciones al terminar: título propio IDESIE y certificación Cualificam.' },
    ],
    phases: ['Fundamentos', 'Ejecución', 'Liderazgo'],
    modules: BIM_MODULES,
    method: {
      title: 'Un día partido en dos. Esa es toda la metodología.',
      lead: 'No es un máster con prácticas al final. Es un trabajo y una formación que empiezan el mismo día.',
      columns: [
        { when: 'Por la mañana', title: 'Trabajas', text: 'Prácticas remuneradas en empresas del sector con las que IDESIE tiene acuerdo. Desde el primer mes, no al final del programa.' },
        { when: 'Por la tarde', title: 'Estudias', text: 'Clases presenciales en Madrid, de lunes a viernes, con profesionales en activo del sector AEC. Lo que ves por la tarde lo aplicas a la mañana siguiente.' },
      ],
      steps: [
        { title: 'Media jornada', text: 'Desde el inicio y durante 10 meses, prácticas matutinas remuneradas para aplicar lo aprendido esa misma tarde.' },
        { title: 'Prácticas a jornada completa', text: 'Al terminar la formación, 6 meses adicionales de prácticas remuneradas a jornada completa.' },
        { title: 'Inserción laboral', text: 'Incorporación definitiva en empresas colaboradoras del sector AEC, muchas veces en la misma donde hiciste prácticas.' },
      ],
    },
    certification: {
      title: 'Certificado por Cualificam y alineado con ISO 19650.',
      text: 'El MBIM cuenta con la certificación Cualificam de la Fundación para el Conocimiento Madri+d, que evalúa y certifica programas de Máster Profesional bajo estándares del Espacio Europeo de Educación Superior. Es la única de los másteres de IDESIE que la posee.',
      items: [
        { title: 'Diploma normalizado', text: 'Certificado con trazabilidad digital, incluido en el Registro de Programas Certificados Cualificam.' },
        { title: 'Estándar internacional', text: 'Programa alineado con ISO 19650, la norma que rige la gestión de la información en proyectos BIM.' },
        { title: 'Red de empresas', text: 'Estudios de arquitectura, ingenierías, constructoras y empresas de facility management, españolas e internacionales.' },
      ],
    },
    outcomes: {
      title: 'A dónde llegas cuando terminas.',
      stats: [
        { value: '95%', text: 'de los alumnos consigue empleo en los seis meses posteriores, muchos en la empresa donde hicieron prácticas.' },
        { value: '100%', text: 'de las prácticas están garantizadas: IDESIE asigna la empresa según tu perfil y tu rendimiento.' },
      ],
      roles: BIM_ROLES,
      note: 'Horquillas de salario bruto anual correspondientes a los perfiles profesionales a los que da acceso el programa.',
    },
    requirements: [
      'Título universitario oficial de Ingeniero, Arquitecto o equivalente',
      'Pasión por la transformación digital del sector AEC mediante BIM',
      'Compromiso con la metodología Learning by Working (mañanas trabajando, tardes estudiando)',
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
      { q: '¿Dónde está IDESIE?', a: 'Nuestro campus está en Madrid, en Plaza de Castilla, una zona bien comunicada con transporte público.' },
      { q: '¿Puedo visitar la escuela?', a: 'Sí, puedes agendar una visita a nuestras instalaciones. Contáctanos para coordinar una fecha que se ajuste a tu disponibilidad.' },
      VISA_FAQ,
    ],
    ai: { kind: 'subject', where: 'Módulo Innovation y asignatura «IA aplicada a la Arquitectura»' },
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
