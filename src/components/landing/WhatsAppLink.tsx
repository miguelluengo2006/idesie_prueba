'use client';

import { CONTACT } from '@/lib/bim';
import { metaTrack } from '@/lib/metaPixel';

const TEXT = 'Hola, quiero información sobre el Máster BIM de IDESIE.';

/** Enlace al chat de WhatsApp de IDESIE con el mensaje ya escrito. Cuenta como contacto en Meta. */
export default function WhatsAppLink({ className = '', tabIndex, label, children }: { className?: string; tabIndex?: number; label?: string; children: React.ReactNode }) {
  return (
    <a
      href={`${CONTACT.whatsappHref}?text=${encodeURIComponent(TEXT)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      tabIndex={tabIndex}
      className={className}
      onClick={() => metaTrack('Contact', { content_name: 'WhatsApp' })}
    >
      {children}
    </a>
  );
}
