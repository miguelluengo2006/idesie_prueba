'use client';

import { useEffect, useState } from 'react';
import CallButton from './CallButton';

/** Barra fija solo en móvil: aparece al pasar el primer pantallazo y se esconde cuando la oferta o el cierre ya están a la vista. */
export default function StickyCta({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const targets = ['reserva', 'cierre'].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const visible = new Set<Element>();
    const update = () => setShow(visible.size === 0 && window.scrollY > 500);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      update();
    }, { threshold: 0.15 });
    targets.forEach((t) => io.observe(t));
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 bg-[#0a1f44] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex border-t border-[#7db4ff]/25 transition-transform duration-300 motion-reduce:transition-none ${show ? 'translate-y-0' : 'translate-y-full'}`}
      aria-hidden={!show}
      inert={!show}
    >
      <CallButton place="sticky-movil" tabIndex={show ? 0 : -1} className="btn btn-blue flex-1 justify-center min-h-12">
        {label}
      </CallButton>
    </div>
  );
}
