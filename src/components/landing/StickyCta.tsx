'use client';

import { useEffect, useState } from 'react';
import ProgramButton from './ProgramButton';

/**
 * Barra fija solo en móvil con «Quiero inscribirme». No tapa lo que se está leyendo: se esconde al bajar
 * y aparece al subir (gesto de «estoy buscando algo»), pasado el primer pantallazo y nunca con el formulario a la vista.
 */
export default function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const target = document.getElementById('inscripcion');
    let formVisible = false;
    let lastY = window.scrollY;
    let up = false;
    const update = () => setShow(up && !formVisible && window.scrollY > 700);
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 6) {
        up = y < lastY;
        lastY = y;
        update();
      }
    };
    const io = new IntersectionObserver(([e]) => {
      formVisible = e.isIntersecting;
      update();
    }, { threshold: 0.05 });
    if (target) io.observe(target);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 bg-[var(--ground)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex transition-transform duration-300 motion-reduce:transition-none ${show ? 'translate-y-0' : 'translate-y-full'}`}
      aria-hidden={!show}
      inert={!show}
    >
      <ProgramButton place="sticky-movil" className="btn-slab flex-1">
        Quiero inscribirme
      </ProgramButton>
    </div>
  );
}
