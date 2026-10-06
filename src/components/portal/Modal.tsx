'use client';

import { useId } from 'react';
import { X } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { cn } from '@/lib/utils';

/** Ventana centrada del panel (hoja inferior en móvil): se cierra con Escape, con la X o pulsando fuera. */
export default function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const titleId = useId();
  useEscapeKey(true, onClose);
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-end sm:items-center justify-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn('card-liquid rounded-t-3xl sm:rounded-3xl w-full max-h-[92dvh] overflow-y-auto p-5 md:p-7', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 -mt-1 -mr-2 rounded-full flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
