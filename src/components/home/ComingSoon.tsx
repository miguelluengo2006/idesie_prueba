/**
 * Marca un dato que la propuesta deja sin cerrar (fecha, alcance, duración). Sustituye a cualquier valor
 * inventado: se ve claro que la información llegará y nunca se publica un hueco con corchetes.
 * Colores fijos: `.home-root` reasigna los tokens white/black/gray.
 */
export default function ComingSoon({ children = 'Próximamente', className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-[#0a1f44]/8 text-[#0a1f44] px-3 py-1 text-[13px] font-semibold ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#ffba08]" aria-hidden="true" />
      {children}
    </span>
  );
}
