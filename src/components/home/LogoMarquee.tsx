import { COMPANY_LOGOS } from '@/lib/content';
import LogoTile from './LogoTile';

const HALF = Math.ceil(COMPANY_LOGOS.length / 2);
const ROWS = [COMPANY_LOGOS.slice(0, HALF), COMPANY_LOGOS.slice(HALF)];

/** Dos cintas de logos en sentidos contrarios. La segunda copia de cada cinta es solo visual (oculta a lectores de pantalla). */
export default function LogoMarquee() {
  return (
    <div className="space-y-4" role="list" aria-label="Empresas que confían en IDESIE">
      {ROWS.map((row, r) => (
        <div key={r} className="marquee">
          <div className={`marquee-track ${r ? 'rev' : ''}`}>
            {[0, 1].map((copy) =>
              row.map((l) => (
                <div key={`${copy}-${l.name}`} role={copy ? undefined : 'listitem'} aria-hidden={copy ? true : undefined} className={copy ? 'marquee-dup' : ''}>
                  <LogoTile logo={l} className="w-48 md:w-56 shrink-0" />
                </div>
              )),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
