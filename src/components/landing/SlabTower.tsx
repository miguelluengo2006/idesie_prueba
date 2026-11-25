/**
 * El edificio de la landing, dibujado como un modelo BIM en axonométrica: cada planta es una losa (forjado) y,
 * encima, la caja de fachada hasta la losa siguiente. Solo rellenos planos en los azules de la marca.
 *
 * - `assemble`: las plantas caen en su sitio una a una al cargar (se respeta prefers-reduced-motion).
 * - `active`: esa planta sale del edificio como un cajón, en la vista explosionada típica de un modelo BIM.
 */

const W = 200; // media anchura de la losa
const H = W / 2; // media altura del rombo (axonometría 2:1)
const T = 20; // canto de la losa
const G = 58; // altura libre de la planta
const P = T + G; // altura entre plantas
const INSET = 0.84; // la fachada retranqueada respecto al canto de la losa

const pts = (...p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(' ');

function Slab({ y, top, left, right }: { y: number; top: string; left: string; right: string }) {
  // y = cota de la cara superior de la losa
  return (
    <>
      <polygon points={pts([-W, y], [0, y + H], [0, y + H + T], [-W, y + T])} fill={left} />
      <polygon points={pts([0, y + H], [W, y], [W, y + T], [0, y + H + T])} fill={right} />
      <polygon className="slab-top" points={pts([0, y - H], [W, y], [0, y + H], [-W, y])} fill={top} />
    </>
  );
}

function Storey({ y }: { y: number }) {
  // Caja de fachada apoyada en la losa (y = cara superior de la losa), con pilares en cada cara
  const w = W * INSET;
  const h = H * INSET;
  const yt = y - G;
  const piers = [0.12, 0.38, 0.64, 0.9];
  return (
    <>
      <polygon points={pts([-w, yt], [0, yt + h], [0, y + h], [-w, y])} fill="#0a2a63" />
      <polygon points={pts([0, yt + h], [w, yt], [w, y], [0, y + h])} fill="#061c45" />
      {piers.map((f) => {
        // pilar en la cara izquierda: de (-w,·) a (0,·+h); y en la derecha, de (0,·+h) a (w,·)
        const lx = -w + f * w;
        const ly = f * h;
        const rx = f * w;
        const ry = h - f * h;
        const pw = 9;
        return (
          <g key={f}>
            <polygon points={pts([lx, yt + ly], [lx + pw, yt + ly + pw / 2], [lx + pw, y + ly + pw / 2], [lx, y + ly])} fill="#1b4fa8" />
            <polygon points={pts([rx, yt + ry], [rx + pw, yt + ry - pw / 2], [rx + pw, y + ry - pw / 2], [rx, y + ry])} fill="#123f8f" />
          </g>
        );
      })}
    </>
  );
}

export default function SlabTower({
  floors,
  active = null,
  assemble = false,
  className = '',
  title,
}: {
  floors: number;
  active?: number | null;
  assemble?: boolean;
  className?: string;
  title?: string;
}) {
  const top = -(floors * P) - H - T;
  const height = floors * P + 2 * H + 3 * T + 90;
  return (
    <svg
      viewBox={`${-W - 20} ${top - 20} ${2 * W + 130} ${height}`}
      className={`tower ${assemble ? 'assemble' : ''} ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      preserveAspectRatio="xMidYMax meet"
    >
      {/* sombra arrojada sobre el terreno: un rombo plano un tono más oscuro que el fondo */}
      <polygon points={pts([0, -H + T + 34], [W + 60, T + 34], [0, H + T + 34 + 30], [-W - 20, T + 34])} fill="#030914" />
      {/* La planta activa se dibuja la última: sale hacia el espectador y nada debe taparla */}
      {[...Array.from({ length: floors }, (_, i) => i).filter((i) => i !== active), 'roof' as const, ...(active !== null && active < floors ? [active] : [])].map((i) => {
        if (i === 'roof') {
          return (
            <g key="roof" className="tower-floor" style={{ ['--i' as string]: floors }}>
              <Slab y={-floors * P} top="#5c9dff" left="#0058d6" right="#0042a3" />
            </g>
          );
        }
        const y = -i * P; // cara superior de la losa de la planta i
        const on = active === i;
        return (
          <g key={i} className="tower-floor" style={{ ['--i' as string]: i, transform: on ? 'translate(78px, 39px)' : 'translate(0px, 0px)' }}>
            <Slab y={y} top={on ? '#dbe8ff' : '#3d8bff'} left={on ? '#8fc0ff' : '#0058d6'} right={on ? '#5c9dff' : '#0042a3'} />
            <Storey y={y} />
          </g>
        );
      })}
    </svg>
  );
}

/** El mismo motivo a tamaño de texto: un cubo axonométrico como viñeta. */
export function SlabBullet({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="-10 -10 20 20" className={className} aria-hidden="true">
      <polygon points="0,-8 9,-3.5 0,1 -9,-3.5" fill="#8fc0ff" />
      <polygon points="-9,-3.5 0,1 0,9 -9,4.5" fill="#006cff" />
      <polygon points="0,1 9,-3.5 9,4.5 0,9" fill="#0042a3" />
    </svg>
  );
}
