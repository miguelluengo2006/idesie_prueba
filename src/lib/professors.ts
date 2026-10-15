/** Claustro de IDESIE: dirección y profesionales en activo de empresas del sector AEC. */

export interface Professor {
  name: string;
  title: string;
  organization: string;
  bio: string;
  group: 'direccion' | 'claustro';
}

export const PROFESSORS: Professor[] = [
  {
    name: 'Fernando Igual',
    title: 'Director General',
    organization: 'IDESIE',
    bio: 'Director General de IDESIE Business & Tech School. Impulsor de metodologías innovadoras de aprendizaje y de la transformación digital del sector AEC.',
    group: 'direccion',
  },
  {
    name: 'Marcos Luengo Sánchez',
    title: 'Presidente · Docente BIM Design MEP',
    organization: 'IDESIE',
    bio: 'Presidente de IDESIE Business School y docente de BIM Design MEP, con amplia experiencia en sistemas MEP y metodologías BIM aplicadas a instalaciones.',
    group: 'direccion',
  },
  {
    name: 'Martin Murphy',
    title: 'Director División Calidad y Sistemas',
    organization: 'Hill International',
    bio: 'Experto en gestión de calidad y sistemas en proyectos de construcción internacional, con más de 20 años de experiencia en el sector AEC.',
    group: 'claustro',
  },
  {
    name: 'Concepción Jeréz',
    title: 'Responsable de Control de Costes y Contratación',
    organization: 'Hill International',
    bio: 'Especialista en control de costes y gestión de contratos en proyectos de gran envergadura. Experta en BIM 5D y optimización de presupuestos.',
    group: 'claustro',
  },
  {
    name: 'Iván Calviño',
    title: 'Socio Fundador',
    organization: 'Ionetree',
    bio: 'Emprendedor y experto en tecnologías digitales para el sector AEC. Fundador de Ionetree, especializada en soluciones para la digitalización de la construcción.',
    group: 'claustro',
  },
  {
    name: 'Laura González Arribas',
    title: 'BIM & Design System Coordinator',
    organization: 'Diseño generativo',
    bio: 'Especialista en coordinación BIM y sistemas de diseño generativo. Experta en flujos de trabajo digitales y diseño paramétrico en proyectos de arquitectura.',
    group: 'claustro',
  },
  {
    name: 'Miguel Villamor',
    title: 'Director General',
    organization: 'AECon · BIM Construction',
    bio: 'Director General de AECon, con amplia experiencia en la implantación de BIM en construcción y en la gestión de equipos multidisciplinares.',
    group: 'claustro',
  },
  {
    name: 'Federico Tabasco',
    title: 'BIM Manager',
    organization: 'ISG',
    bio: 'BIM Manager en ISG, con experiencia en la gestión y coordinación de proyectos BIM complejos y en estándares internacionales.',
    group: 'claustro',
  },
  {
    name: 'Araceli Herranz Tejedor',
    title: 'Especialista BIM Construction',
    organization: 'Presupuestos y control de costes',
    bio: 'Experta en BIM Construction y gestión de presupuestos. Especialista en 5D BIM y control de costes en proyectos de construcción.',
    group: 'claustro',
  },
  {
    name: 'Fernando Valladares',
    title: 'Subdirector General',
    organization: 'Valladares Ingeniería',
    bio: 'Amplia trayectoria en ingeniería civil e infraestructuras. Experto en gestión de proyectos complejos y en BIM aplicado a ingeniería.',
    group: 'claustro',
  },
  {
    name: 'Carlos Martín',
    title: 'Socio Director',
    organization: 'L35 Arquitectura · BIM Design',
    bio: 'Socio Director en L35 Arquitectura, especializado en BIM Design y en la gestión de equipos multidisciplinares en proyectos complejos.',
    group: 'claustro',
  },
  {
    name: 'Francisco Javier López',
    title: 'BIM Manager',
    organization: 'Sir Robert McAlpine',
    bio: 'BIM Manager y docente de protocolos BIM. Experto en estándares internacionales y trabajo colaborativo en proyectos de construcción de gran escala.',
    group: 'claustro',
  },
  {
    name: 'Rubén San León',
    title: 'Arquitecto técnico',
    organization: 'Revisión de modelos',
    bio: 'Especializado en revisión y control de calidad de modelos BIM y en coordinación técnica en proyectos de construcción sostenible.',
    group: 'claustro',
  },
  {
    name: 'Roberto San Miguel',
    title: 'Docente en Innovación',
    organization: 'Experto en BIMO',
    bio: 'Docente de innovación y experto en BIMO (Building Information Modeling Operations). Aplica tecnologías emergentes al sector AEC.',
    group: 'claustro',
  },
  {
    name: 'Marta Gutiérrez Arribas',
    title: 'Docente en BIM Design',
    organization: 'Consultora BIM',
    bio: 'Docente de BIM Design y consultora BIM independiente. Experta en diseño paramétrico y modelado avanzado.',
    group: 'claustro',
  },
  {
    name: 'Francisco Pastor Gil',
    title: 'Docente en Facility Management',
    organization: 'Gerente de proyectos',
    bio: 'Docente de Facility Management y gerente de proyectos, con experiencia en gestión de instalaciones y BIM 6D.',
    group: 'claustro',
  },
  {
    name: 'Víctor Aparici Godoy',
    title: 'Docente en Infrastructure BIM Management',
    organization: 'Consulting, Engineering, Architecture',
    bio: 'Experiencia en consultoría, ingeniería y arquitectura. Experto en gestión BIM de infraestructuras y proyectos de gran escala.',
    group: 'claustro',
  },
];

export const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
