import Image from 'next/image';

/** Logotipo oficial de IDESIE: azul sobre fondos claros, blanco sobre fondos oscuros. */
export default function IdesieLogo({ tone = 'blue', className = 'h-9', priority = false }: { tone?: 'blue' | 'white'; className?: string; priority?: boolean }) {
  return (
    <Image
      src={tone === 'white' ? '/img/idesie-logo-white.png' : '/img/idesie-logo.png'}
      alt="IDESIE Business & Technology School"
      width={337}
      height={117}
      priority={priority}
      className={`w-auto ${className}`}
    />
  );
}
