'use client';

import { CalendarCheck } from 'lucide-react';
import { useBookCall } from '@/components/home/BookCall';
import { metaTrackCustom } from '@/lib/metaPixel';

export const CALL_INTEREST = 'Máster BIM Full Time · landing';

/** Abre el calendario para agendar la llamada de 30 minutos. `place` dice a Meta qué bloque de la landing convence. */
export default function CallButton({ className = '', children, place, tabIndex }: { className?: string; children: React.ReactNode; place: string; tabIndex?: number }) {
  const { open } = useBookCall();
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      className={className}
      onClick={() => {
        metaTrackCustom('CallOpen', { place });
        open(CALL_INTEREST);
      }}
    >
      <CalendarCheck className="w-5 h-5" aria-hidden="true" />
      {children}
    </button>
  );
}
