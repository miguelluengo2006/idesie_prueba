'use client';

import { useEffect } from 'react';

/**
 * Entradas al hacer scroll: cada elemento con la clase `rise` sube y aparece una sola vez al entrar en pantalla,
 * con el retraso que marque su `--d`. Sin JavaScript (o con movimiento reducido) todo se ve desde el principio.
 */
export default function Rise() {
  useEffect(() => {
    const root = document.querySelector('.lx');
    if (!root || !('IntersectionObserver' in window)) return;
    root.classList.add('js');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    root.querySelectorAll('.rise').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
