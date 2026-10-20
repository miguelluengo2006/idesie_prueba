'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { BadgeCheck, ShieldCheck } from 'lucide-react';

/**
 * El carnet digital de competencias, a modo de ejemplo. Se inclina siguiendo el puntero y deja un brillo.
 * `stage` (1–4) lo va rellenando paso a paso; sin `stage` se muestra completo. Siempre marcado como ilustrativo.
 */
export default function CertCard({ profile, holder, stage = 4, className = '' }: { profile: string; holder: string; stage?: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 140, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-14, 14]), { stiffness: 140, damping: 18 });
  const shine = useTransform([mx, my], ([x, y]) => `radial-gradient(420px circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(255,255,255,0.32), transparent 55%)`);

  const done = (n: number) => stage >= n;

  return (
    <div style={{ perspective: 1100 }} className={className}>
      <motion.div
        ref={ref}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onMouseLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="relative overflow-hidden rounded-[1.75rem] bg-[#0063e6] text-[#fff] p-6 md:p-8 aspect-[1.58/1] flex flex-col justify-between shadow-[0_50px_90px_-30px_rgba(0,50,160,0.85)] ring-1 ring-[#fff]/25"
        role="img"
        aria-label={`Ejemplo ilustrativo de carnet digital de competencias. Perfil: ${profile}. Titular: ${holder}. Norma ISO/IEC 17024. Vigencia 3 años.`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0a1f44_0%,#0052cc_55%,#0063e6_100%)]" aria-hidden="true" />
        {!reduce && <motion.div className="absolute inset-0 pointer-events-none" style={{ background: shine }} aria-hidden="true" />}

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="font-kinetic font-bold text-lg md:text-xl leading-tight">Certificado profesional</p>
            <p className="text-sm text-[#fff]/80 mt-1">Emitido por AECOMI</p>
          </div>
          <ShieldCheck className="w-9 h-9 text-[#7db4ff]" aria-hidden="true" />
        </div>

        <div className="relative">
          <p className="text-sm text-[#fff]/75">Perfil</p>
          <motion.p key={profile} initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} className="font-kinetic font-bold text-2xl md:text-3xl leading-tight">
            {profile}
          </motion.p>
        </div>

        <dl className="relative grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-[#fff]/75">Titular</dt>
            <dd className="font-semibold truncate">{holder}</dd>
          </div>
          <div>
            <dt className="text-[#fff]/75">Norma</dt>
            <dd className="font-semibold">ISO/IEC 17024</dd>
          </div>
          <div>
            <dt className="text-[#fff]/75">Vigencia</dt>
            <dd className="font-semibold">3 años</dd>
          </div>
          <div>
            <dt className="text-[#fff]/75">Estado</dt>
            <dd className={`font-semibold inline-flex items-center gap-1.5 transition-opacity duration-500 ${done(4) ? 'opacity-100' : 'opacity-40'}`}>
              <BadgeCheck className="w-4 h-4" aria-hidden="true" /> {done(4) ? 'Verificado' : 'Pendiente'}
            </dd>
          </div>
        </dl>

        {stage < 4 && (
          <div className="absolute left-0 right-0 bottom-0 flex" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={`h-1.5 flex-1 transition-colors duration-500 ${done(n) ? 'bg-[#7db4ff]' : 'bg-[#fff]/15'}`} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
