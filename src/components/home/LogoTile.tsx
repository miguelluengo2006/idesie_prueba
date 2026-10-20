import Image from 'next/image';
import { COMPANY_LOGOS } from '@/lib/content';

export type CompanyLogo = (typeof COMPANY_LOGOS)[number];

/** Logo de una empresa sobre una ficha blanca de tamaño fijo, para que todos pesen parecido aunque su proporción sea distinta. */
export default function LogoTile({ logo, className = '' }: { logo: CompanyLogo; className?: string }) {
  return (
    <div className={`bg-[#fff] rounded-3xl grid place-items-center h-24 md:h-28 px-6 ${className}`}>
      <Image
        src={logo.src}
        alt={logo.name}
        width={logo.width}
        height={logo.height}
        unoptimized
        className="w-auto h-auto max-h-12 md:max-h-14 max-w-[8.5rem] md:max-w-[10rem] object-contain"
      />
    </div>
  );
}
