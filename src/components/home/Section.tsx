/** Sección a todo el ancho con un campo de color (white | tint | navy) y contenedor centrado: el único contenedor de la web. */
export default function Section({
  field = 'white',
  id,
  labelledBy,
  className = '',
  children,
}: {
  field?: 'white' | 'tint' | 'navy';
  id?: string;
  labelledBy?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`field-${field} px-4 md:px-6 py-20 md:py-28 scroll-mt-24 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}
