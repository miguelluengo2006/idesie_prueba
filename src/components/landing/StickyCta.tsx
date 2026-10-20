'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import WhatsAppLink from './WhatsAppLink';

/** Barra fija solo en móvil: aparece al salir el formulario de la pantalla y se esconde cuando vuelve a verse. */
export default function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const targets = ['info'].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setShow(visible.size === 0 && window.scrollY > 300);
      },
      { threshold: 0.05 },
    );
    targets.forEach((t) => io.observe(t));
    const onScroll = () => setShow(visible.size === 0 && window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 bg-[#0a1f44] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2 transition-transform duration-300 ${show ? 'translate-y-0' : 'translate-y-full'}`}
      aria-hidden={!show}
    >
      <WhatsAppLink tabIndex={show ? 0 : -1} label="Escribir por WhatsApp" className="min-h-12 w-14 grid place-items-center rounded-xl bg-[#25D366] text-[#0a1f44]">
        <MessageCircle className="w-6 h-6" aria-hidden="true" />
      </WhatsAppLink>
      <a href="#info" tabIndex={show ? 0 : -1} className="btn btn-blue flex-1 justify-center min-h-12">
        Quiero información <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </a>
    </div>
  );
}
