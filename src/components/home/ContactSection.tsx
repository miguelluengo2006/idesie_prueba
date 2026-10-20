import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import BookCallForm from '@/components/home/BookCallForm';
import { CONTACT } from '@/lib/bim';

/** Sección de contacto: datos y formulario de reserva de llamada. Se usa en la home y en /contacto. */
export default function ContactSection() {
  return (
    <section id="contacto" className="field-white px-4 md:px-6 py-24 md:py-32 scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--signal)]">Hablemos</span>
        <h2 className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.15] mt-4 mb-4">Agenda tu <span className="ui-hl">llamada</span></h2>
        <p className="text-white/60 max-w-lg mb-8">
          Elige un hueco y respóndenos unas preguntas rápidas: en 30 minutos te orientamos sobre el perfil que mejor encaja contigo
          o con tu equipo. ¿Prefieres explorar antes?{' '}
          <Link href="/perfiles" className="text-[var(--signal)] hover:underline">Mira los perfiles profesionales</Link>.
        </p>

        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70 mb-12">
          <li className="inline-flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--signal)]" aria-hidden="true" /> {CONTACT.address}
          </li>
          <li>
            <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4 text-[var(--signal)]" aria-hidden="true" /> {CONTACT.phone}
            </a>
          </li>
          <li>
            <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4 text-[var(--signal)]" aria-hidden="true" /> {CONTACT.email}
            </a>
          </li>
        </ul>

        <BookCallForm businessName={CONTACT.name} />
      </div>
    </section>
  );
}
