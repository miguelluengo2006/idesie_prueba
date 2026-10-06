'use client';

import { SmtpIntegration } from './SmtpIntegration';

/** Correo de envío: avisos de leads y campañas a contactos. */
export function PlatformSettings() {
  return (
    <div className="space-y-8">
      <section id="smtp" className="scroll-mt-24">
        <h2 className="pn-title mb-4">Email (avisos y campañas)</h2>
        <p className="text-sm text-white/55 mb-4 max-w-2xl">
          Desde esta cuenta se envían los avisos de cada lead nuevo y las campañas a tus contactos. Usa una dirección de IDESIE (por ejemplo info@idesie.com);
          con un buzón gratuito como Gmail los envíos masivos suelen acabar en spam y el límite diario es bajo.
        </p>
        <SmtpIntegration />
      </section>
    </div>
  );
}
