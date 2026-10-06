'use client';

import { motion } from 'framer-motion';

/** Aparece desde abajo al entrar en pantalla, igual que el resto de secciones de la web. */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Cabecera de sección: etiqueta, título y entradilla. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  className = '',
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={`max-w-3xl ${className}`}>
      <span className="text-xs tracking-[0.25em] uppercase text-[var(--signal)]">{eyebrow}</span>
      <h2 className="font-kinetic font-black uppercase text-3xl md:text-5xl leading-[1.05] mt-4">{title}</h2>
      {lead && <p className="text-white/60 mt-5 text-base md:text-lg leading-relaxed">{lead}</p>}
    </Reveal>
  );
}
