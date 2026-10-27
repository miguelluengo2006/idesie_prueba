# Avisos de leads por email con Resend

Cada vez que llega un lead (llamada agendada, Pack de Bienvenida, formulario de la landing o propuesta de la web)
o una compra pagada, se envía un correo con el diseño de samgple a tu bandeja. El lead **siempre** se
guarda en el panel; el email es un aviso extra: si falla, no se pierde nada.

## Configurar (5 minutos)

1. Crea una cuenta en [resend.com](https://resend.com) y una **API key** (Sending access).
2. Verifica tu dominio en Resend → *Domains* (añade los registros DNS que te indica: SPF y DKIM).
3. Variables en el servidor:

```
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM=samgple <avisos@tu-dominio.com>
LEAD_NOTIFY_EMAIL=tu@correo.com        # opcional; varios separados por comas
```

4. Reinicia el servidor y haz una prueba: agenda una llamada desde la web o rellena el formulario de la landing.

Sin `RESEND_FROM` se usa `onboarding@resend.dev`, el remitente de pruebas de Resend, que **solo entrega al correo
de tu cuenta de Resend**. Sirve para probar, no para producción.

Sin `LEAD_NOTIFY_EMAIL`, el aviso va al email de la cuenta del panel (o a `ADMIN_EMAIL`).

## Solo Resend

Todos los correos (avisos, invitaciones de equipo y campañas) salen por Resend. No hay SMTP: sin `RESEND_API_KEY`
los leads se guardan igual, pero no se envía ningún correo y las campañas no se pueden enviar.

## Qué correos se envían

| Correo | Cuándo | Asunto |
| --- | --- | --- |
| Llamada agendada | Alguien reserva hueco en la web | `Nueva llamada agendada — Nombre (Empresa) · Miércoles, 30 de septiembre · 10:30` |
| Pack de Bienvenida | Formulario de la landing (antes de pagar) | `Nuevo lead del Pack de Bienvenida — Empresa` |
| Lead de la landing | Formulario general de la landing | `Nuevo lead de la landing — Nombre (Empresa)` |
| Propuesta web | Formulario de propuesta de la web | `Nueva propuesta solicitada — Nombre (Empresa)` |
| Compra pagada | Pago confirmado por Flywire | `Nueva compra — Pack · 30 € (IVA incluido)` |

Cada correo lleva el teléfono, los botones **Abrir en el panel**, **Escribir por WhatsApp** y **Responder por email**,
las respuestas del formulario y el origen del anuncio (campaña, fuente…). «Responder» del correo va directo al cliente
(`reply-to`). El diseño está en `src/lib/emailTemplates.ts`; el envío, en `src/lib/leadMailer.ts`.

## Problemas típicos

- **No llega nada:** mira el log del servidor; los errores salen como `Resend 403: …`. Lo más común es un dominio sin verificar o
  un `RESEND_FROM` de un dominio que no es tuyo.
- **Llega a spam:** verifica SPF/DKIM del dominio en Resend y usa un remitente de tu propio dominio.
- **Envío duplicado:** cada aviso lleva una `Idempotency-Key` (`lead-<id>` / `order-<sesión>`), así que Resend ignora los reintentos.

# Campañas: quién ha recibido, abierto y pulsado cada email

Las campañas (Panel → Campañas) salen por Resend. Para ver **por persona** si el email se entregó, se abrió, si pulsó un
enlace o si rebotó, hay que conectar el webhook de Resend. Sin él las campañas se envían igual, pero solo sabrás «Enviado».

## Activar el seguimiento (10 minutos, una sola vez)

1. **Base de datos:** ejecuta `migrations/add-email-tracking.sql` en Supabase (SQL Editor). Es seguro repetirla.
2. **Seguimiento en el dominio:** Resend → *Domains* → tu dominio → activa **Open Tracking** y **Click Tracking**.
   (Sin esto Resend avisa de entregas y rebotes, pero no de aperturas ni clics.)
3. **Webhook:** Resend → *Webhooks* → *Add Webhook*:
   - Endpoint: `https://TU-DOMINIO/api/webhooks/resend`
   - Eventos: `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`,
     `email.opened`, `email.clicked`, `email.failed`
4. Copia el **Signing Secret** (`whsec_…`) a la variable `RESEND_WEBHOOK_SECRET` del servidor (Vercel → Environment Variables) y redespliega.
5. Envía una campaña de prueba a tu propio correo (botón «Enviarme una prueba» no deja rastro; para ver el seguimiento
   hay que enviar una campaña real a un contacto tuyo).

## Qué se ve

En una campaña enviada aparece **Resultados**: enviados, entregados, abiertos, clics y rebotes (contando personas, no
eventos) y una fila por destinatario con su estado, cuántas veces abrió, qué enlaces pulsó y el motivo si rebotó.
Se refresca solo cada 30 s.

- Una **queja de spam** da de baja automáticamente al contacto.
- Un clic cuenta también como apertura (hay clientes de correo que bloquean la imagen de medida).
- Las **aperturas no son exactas** (Apple Mail precarga las imágenes). Los clics y las entregas sí son fiables.
- Los avisos duplicados se descartan (`svix-id` único) y los que llegan sin firma válida se rechazan con 401.

## Plantillas y bloques

En el editor de una campaña (borrador) hay una barra con **Plantillas · Título · Imagen · Botón · Lista · Separador**.
Cada bloque se inserta como un párrafo propio en el texto; el formato completo está en «Cómo dar formato».
«Plantillas» ofrece las de partida de IDESIE y las que guardes tú (*Guardar el email actual como plantilla*).

> Los botones y las imágenes siempre llevan una dirección `https://` completa. Las imágenes tienen que estar ya
> publicadas en una URL pública; los clientes de correo no admiten imágenes adjuntas dentro del HTML de forma fiable.
