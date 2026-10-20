'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/** Botón fijo para volver arriba: aparece al pasar el carrusel. */
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Volver arriba"
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
      className={`fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-[#0a1f44] text-[#fff] grid place-items-center transition-[opacity,transform] duration-300 hover:bg-[#0063e6] cursor-pointer ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}
