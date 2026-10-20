import type { Metadata } from 'next';
import LegalPage, { H2, Legal } from '@/components/legal/LegalPage';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = { title: `Términos y condiciones — ${LEGAL.brand}`, robots: { index: true, follow: true } };

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones">
      <p>
        Estas condiciones regulan la contratación de los programas formativos y servicios que <Legal v={LEGAL.name} /> (NIF/CIF <Legal v={LEGAL.taxId} />,
        en adelante «{LEGAL.brand}») ofrece a través de {LEGAL.domain}. Al marcar la casilla de aceptación y pagar, aceptas estas condiciones.
      </p>

      <H2>1. Servicios</H2>
      <p>
        {LEGAL.brand} imparte formación en BIM y metodologías relacionadas: másteres, títulos y cursos. El contenido, la duración, la modalidad y la
        titulación de cada programa son los indicados en su ficha de la Web en el momento de la contratación. Las certificaciones profesionales de perfiles
        las emite AECOMI de forma independiente; {LEGAL.brand} forma pero no garantiza que se obtenga la certificación.
      </p>

      <H2>2. Contratación y precios</H2>
      <ul>
        <li>Todos los precios se muestran en euros e <strong>incluyen el IVA</strong>, salvo que se indique lo contrario.</li>
        <li>El contrato se perfecciona cuando completas el pago y recibes la confirmación por email. {LEGAL.brand} puede rechazar una inscripción por causa justificada (por ejemplo, falta de plazas o de requisitos de acceso), reembolsando lo cobrado.</li>
        <li>Los datos que indiques en la compra (nombre, apellidos y email) son los que se usarán para tu matrícula y para la factura. Revísalos antes de pagar.</li>
        <li>Los programas sin precio publicado se contratan tras una conversación con admisiones.</li>
        <li>Los códigos de descuento son personales, no acumulables y pueden tener fecha de caducidad, productos concretos o un número máximo de usos.</li>
      </ul>

      <H2>3. Reserva de plaza</H2>
      <p>
        En los másteres con reserva online, el importe abonado en la Web (por ejemplo, 3.000 €) es una <strong>reserva de plaza</strong> que se descuenta
        del precio total del programa. El resto del importe, y las posibles opciones de pago fraccionado o financiación, se acuerdan con el equipo de
        admisiones tras la reserva. La reserva garantiza tu plaza en la convocatoria indicada por admisiones.
      </p>

      <H2>4. Pago</H2>
      <p>
        El pago se realiza a través de <strong>Flywire</strong>, una pasarela de pago segura, con tarjeta o transferencia según las opciones disponibles.
        {' '}{LEGAL.brand} no almacena los datos de tu tarjeta. Los pagos pueden requerir autenticación reforzada de tu banco.
      </p>

      <H2>5. Desarrollo de la formación</H2>
      <p>
        Las fechas de inicio, los horarios y el profesorado pueden ajustarse por causas organizativas, comunicándotelo con antelación. Si {LEGAL.brand}
        no pudiera iniciar una convocatoria, te ofrecerá una convocatoria posterior equivalente o el reembolso íntegro de lo abonado. Te comprometes a
        hacer un uso adecuado de las plataformas, materiales y aulas, y a no compartir tus credenciales ni reproducir los contenidos.
      </p>

      <H2>6. Propiedad intelectual</H2>
      <p>
        Los materiales, plataformas y contenidos formativos son titularidad de {LEGAL.brand} o de sus autores y se ceden para tu uso personal y
        formativo. Queda prohibida su reproducción o distribución sin autorización.
      </p>

      <H2>7. Derecho de desistimiento y cancelación</H2>
      <p>
        Si eres consumidor o usuario, tienes <strong>14 días naturales</strong> desde la contratación para desistir sin indicar motivo, siempre que la formación
        no haya comenzado. Si solicitas que el servicio comience antes de que acabe ese plazo y desistes, abonarás la parte proporcional de lo ya prestado.
        Para desistir, escribe a <Legal v={LEGAL.email} /> indicando tu número de pedido; reembolsaremos lo cobrado por el mismo medio de pago en un
        máximo de 14 días desde que recibamos tu solicitud. Las condiciones particulares de cancelación de la reserva de plaza una vez iniciada la
        convocatoria te las indicará admisiones antes de formalizar la matrícula.
      </p>

      <H2>8. Garantía y responsabilidad</H2>
      <p>
        {LEGAL.brand} se compromete a impartir la formación con la diligencia profesional debida y conforme a lo descrito. No garantiza resultados
        concretos de empleo, de aprobado o de certificación, que dependen también del esfuerzo del alumno y de terceros. Salvo dolo o negligencia grave y
        lo que la ley imponga, la responsabilidad total de {LEGAL.brand} se limita al importe pagado por el servicio afectado.
      </p>

      <H2>9. Protección de datos</H2>
      <p>
        Tratamos tus datos conforme a la <a href="/privacidad">Política de privacidad</a> y usamos cookies según la <a href="/cookies">Política de cookies</a>.
      </p>

      <H2>10. Modificaciones, ley aplicable y reclamaciones</H2>
      <p>
        Podemos modificar estas condiciones; se aplicarán a las contrataciones posteriores a su publicación. El contrato se rige por la legislación
        española. Los consumidores pueden acudir a los tribunales de su domicilio y a la plataforma europea de resolución de litigios en línea
        (<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>). Para cualquier reclamación,
        escribe a <Legal v={LEGAL.email} />.
      </p>
    </LegalPage>
  );
}
