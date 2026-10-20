'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Cajita animada: entra escalonada al hacer scroll, se eleva al pasar el cursor y deja un foco de luz que sigue al puntero.
 * El foco usa --mx/--my y desaparece con movimiento reducido.
 */
export default function Tile({
  children,
  className = '',
  delay = 0,
  as = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li';
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const Comp = as === 'li' ? motion.li : motion.div;

  return (
    <Comp
      ref={ref as never}
      initial={{ opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={reduce ? undefined : { y: -6 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={(e: React.MouseEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
      }}
      className={`group tile-glow relative overflow-hidden rounded-3xl ${className}`}
    >
      {children}
    </Comp>
  );
}
