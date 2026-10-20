# IDESIE Business & Tech School

Web pública y CRM de IDESIE (escuela de formación BIM, Madrid). Next.js (App Router) + Tailwind + Supabase.

- **Web pública**: másteres, microcredenciales, perfiles, simulador, certificación AECOMI, empresas y **tienda** (`/tienda`, `/checkout`) con pago por Flywire.
- **Landing de captación** (`/landing`).
- **CRM** (`/portal`, acceso oculto por enlace y passkeys): leads, llamadas, contactos, campañas, pedidos, cupones y productos.

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:3001
npm test
```

Variables de entorno: ver `.env.example` (Supabase, `NEXT_PUBLIC_SITE_URL`, `ENCRYPTION_SECRET`, `CRM_ENTRY_KEY`, `FLYWIRE_SHARED_SECRET`).

## Documentación

- [Email con Resend](docs/EMAIL_RESEND.md)
- [Passkeys para el equipo](docs/PASSKEYS.md)
