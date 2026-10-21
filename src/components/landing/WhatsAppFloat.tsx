import { MessageCircle } from 'lucide-react';
import WhatsAppLink from './WhatsAppLink';

/** Botón flotante de WhatsApp, siempre visible. En móvil queda por encima de la barra de «Agendar mi llamada». */
export default function WhatsAppFloat() {
  return (
    <WhatsAppLink
      label="Escribir por WhatsApp"
      className="fixed z-50 right-4 bottom-24 md:right-6 md:bottom-6 w-14 h-14 rounded-full grid place-items-center bg-[#25D366] text-[#0a1f44] shadow-[0_10px_30px_-8px_rgba(0,20,70,0.55)] hover:bg-[#3ae07a] hover:scale-105 motion-reduce:hover:scale-100 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a1f44]"
    >
      <MessageCircle className="w-7 h-7" aria-hidden="true" />
    </WhatsAppLink>
  );
}
