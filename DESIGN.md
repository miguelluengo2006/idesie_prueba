---
name: IDESIE
description: Escuela BIM que forma expertos y enseña a aplicar IA; web pública clara con azul de señal idesie.com.
colors:
  signal-blue: "#006cff"
  signal-blue-ink: "#0063e6"
  signal-blue-deep: "#0052cc"
  signal-blue-night: "#0042a3"
  navy-ink: "#0a1f44"
  accent-yellow: "#ffba08"
  paper-blue: "#dbe8ff"
  site-ink: "#0d1522"
  paper-white: "#ffffff"
  night-black: "#0a0a0a"
  muted-gray: "#666666"
  destructive: "#dc4b34"
typography:
  display:
    fontFamily: "Unbounded Variable, Unbounded, Oswald, Inter Variable, system-ui, sans-serif"
    fontSize: "clamp(1.65rem, 4vw, 3rem)"
    fontWeight: 900
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Unbounded Variable, Unbounded, sans-serif"
    fontWeight: 700
    letterSpacing: "0.01em"
  body:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  accent-serif:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontWeight: 400
rounded:
  md: "8px"
  xl: "12px"
  card: "16px"
  pill: "9999px"
spacing:
  page-gutter: "16px"
  section-y: "64px"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue-ink}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
    padding: "8px 8px 8px 24px"
  button-primary-hover:
    backgroundColor: "{colors.signal-blue-deep}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.site-ink}"
    rounded: "{rounded.md}"
---

# Design System: IDESIE

## Overview

**Creative North Star: "El estudio de arquitectura vivo"**

La web de IDESIE debe sentirse como un estudio de arquitectura donde el plano BIM cobra vida: precisión técnica, estructura clara y un movimiento fluido que enseña cómo se construye algo. Transmite expertise (el producto son expertos BIM que aplican IA), no decoración. El objetivo es que quien entra se interese por los másteres y microcredenciales, así que cada pantalla debe tener una cosa dominante y un siguiente paso claro.

El sistema actual combina un fondo claro con el azul idesie.com como único color de señal, tipografía display muy pesada (Unbounded) sobre cuerpo en Inter, superficies planas y secciones a todo el ancho por campos de color (blanco, azul claro y azul marino). Un único estilo en toda la web pública: el azul se conserva; el movimiento va en las entradas y el carrusel (alta y coreografiada), siempre respetando `prefers-reduced-motion`.

Rechazos confirmados: aspecto de plantilla de IA, tono de universidad aburrida (stock, texto denso, frío), exceso de recarga que distraiga de leer o comprar, y perder el azul actual.

**Key Characteristics:**
- Un solo azul de señal protagonista sobre fondo claro; amarillo y azul marino como acentos puntuales.
- Display pesado y compacto; cuerpo legible a 16px.
- Movimiento como pedagogía: las cosas se "construyen" al entrar.
- Modo claro en la web pública (`.home-root` fuerza `color-scheme: light`); claro/oscuro en portal y panel.

## Colors

Paleta de un azul dominante con neutros fríos y un acento amarillo escaso.

### Primary
- **Azul Señal** (#006cff): acento de marca y botones sobre fondos oscuros; escala `olive-*` (nombre heredado) de 50 a 950.
- **Azul Señal Tinta** (#0063e6): versión para texto y botones sobre paneles claros (`--signal` en `.home-root`), algo más oscura para contraste.
- **Azul Profundo** (#0052cc): hover y estados pulsados.

### Secondary
- **Marino Tinta** (#0a1f44): tarjetas oscuras de la web (`--ink-solid`).
- **Amarillo Acento** (#ffba08): acento puntual de idesie.com (`--yellow`).

### Neutral
- **Papel Azulado** (#dbe8ff): campo azul claro (`.field-tint`) que alterna con el blanco y el marino.
- **Tinta del Sitio** (#0d1522): texto en la web pública.
- **Blanco / Negro Noche** (#ffffff / #0a0a0a): fondo de portal y panel según modo.
- **Gris Apagado** (#666666): texto secundario.
- **Rojo Alerta** (#dc4b34): errores y acciones destructivas.

### Named Rules
**The Una Señal Rule.** El azul es el único color saturado de una pantalla; el amarillo aparece como máximo en un detalle.
**The Contraste Rule.** Texto pequeño sobre claro usa Azul Señal Tinta (#0063e6), nunca #006cff.

## Typography

**Display Font:** Unbounded Variable (con Oswald, Inter, system-ui)
**Body Font:** Inter Variable (con system-ui)
**Accent Font:** Instrument Serif (`.font-serif-display`), uso esporádico
**Label/Mono Font:** Commit Mono, solo código

**Character:** Display ancho, pesado y en mayúsculas para titulares con presencia; Inter neutral para leer. El serif es un toque editorial ocasional.

### Hierarchy
- **Display** (900, clamp(1.65rem → 3rem), 1.02): titulares de hero en `.font-kinetic`, mayúsculas.
- **Headline** (700, escala Tailwind): títulos de sección con Unbounded.
- **Body** (400, 16–20px, 1.5): texto corrido; líneas de 65–75ch.
- **Label** (12px, tracking 0.25em, mayúsculas): rótulos sobre el titular en el hero actual.

### Named Rules
**The Dos Titulares Rule.** Un titular no pasa de dos líneas en ningún ancho.

## Layout

Contenedor `max-w-6xl` centrado, gutters de 16px en móvil y 24px desde `md`. Hero en rejilla `1.25fr / 1fr` desde `lg`. Secciones con padding vertical amplio (`py-16`/`pt-36`). Cabecera fija de 64px con desenfoque. Mobile-first; la navegación principal se oculta bajo `lg`.

## Elevation & Depth

Sistema plano: cada sección es un campo (`.field-white`, `.field-tint`, `.field-navy`) y las tarjetas (`.ui-card`) se distinguen por un escalón de tono, sin bordes, sombras ni desenfoque. Titulares con una palabra marcada (`.ui-hl`), botones píldora con punto de flecha (`.btn-cta` amarillo sobre oscuro, `.btn-blue` sobre claro). El fondo animado queda solo en `/landing`.

### Shadow Vocabulary
- **Reposo cristal** (`inset 0 1px 0 rgba(255,255,255,.6), 0 1px 2px rgba(10,10,10,.04), 0 8px 24px -12px rgba(10,10,10,.12)`): tarjetas en reposo.
- **Elevada** (`0 16px 32px -14px rgba(43,85,148,.3)`): hover de tarjetas interactivas.

### Named Rules
**The Profundidad Con Motivo Rule.** El desenfoque y la elevación señalan jerarquía o interacción; no se añaden como adorno.

## Shapes

Esquinas generosas: 8px en campos y botones de contorno, 12px en iconos-insignia, 16px en tarjetas y paneles, píldora completa en botones principales de la web. Bordes de 1px a baja opacidad.

## Components

### Buttons
- **Shape:** píldora (9999px) en el botón principal; 8px en el botón de contorno.
- **Primary:** fondo Azul Señal Tinta, texto blanco, relleno `8px 8px 8px 24px` con flecha en un círculo a la derecha.
- **Hover / Focus:** a Azul Profundo, `translateY(-1px)`, transición 0.3s.
- **Outline (`.btn-minimal`):** transparente con borde 1px al 20 %; hover rellena al 6–10 %.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** cristal translúcido claro u oscuro según modo.
- **Shadow Strategy:** ver Elevation & Depth.
- **Border:** 1px a 8 % de opacidad.

### Navigation
Cabecera fija, 64px, fondo oscuro translúcido con desenfoque, wordmark animado (`KineticWordmark`), enlaces de texto y submenú de Formación; en móvil se colapsa.

### Reveal / Motion
Entradas con `framer-motion` (`Reveal`, 0.55s con retardo escalonado); hero y wordmark cinéticos; marquesina de logos que se pausa al hover.

## Do's and Don'ts

### Do:
- **Do** mantener el azul idesie.com (#006cff / #0063e6) como único color saturado.
- **Do** animar con intención: entradas en cascada por sección, microinteracciones en botones y tarjetas, solo `transform` y `opacity`.
- **Do** respetar `prefers-reduced-motion` en toda animación.
- **Do** dejar un solo elemento dominante por pantalla y un siguiente paso claro.
- **Do** usar solo pruebas reales (profesores, certificación AECOMI); marcar lo provisional.

### Don't:
- **Don't** parecer una plantilla de IA: evitar filas de tarjetas idénticas con icono y degradados morados.
- **Don't** caer en tono de universidad aburrida: fotos de stock o texto denso.
- **Don't** recargar: la animación no debe retrasar la lectura ni la compra.
- **Don't** alejarse del azul actual de idesie.com.
