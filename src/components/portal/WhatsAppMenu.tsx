'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle } from 'lucide-react';
import { WA_INTENTS, firstName, suggestedIntent, waLink, type WaContext, type WaIntent } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

const MENU_W = 300;
const GAP = 6;

/**
 * Botón de WhatsApp de una persona. Al pulsarlo eliges para qué quieres escribirle (agendar llamada, recordatorio,
 * información, admisión, matrícula…) y se abre el chat con el mensaje ya redactado. Lo recomendado según su etapa va el primero.
 * El menú se dibuja dentro del panel (no del botón) para que ninguna zona con scroll lo recorte.
 */
export default function WhatsAppMenu({
  phone,
  name,
  status,
  context,
  variant = 'icon',
  className,
}: {
  phone: string | null | undefined;
  name: string;
  /** Etapa del proceso: decide qué motivo se recomienda */
  status?: string | null;
  context?: Omit<WaContext, 'name'>;
  /** `icon`: solo el icono (filas y tarjetas) · `button`: con texto */
  variant?: 'icon' | 'button';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const ctx: WaContext = { ...context, name };
  const suggested = suggestedIntent(status);
  const items = [...WA_INTENTS].sort((a, b) => (a.id === suggested ? -1 : b.id === suggested ? 1 : 0));
  const canWrite = !!waLink(phone, 'blank');

  const place = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const menuH = menuRef.current?.offsetHeight ?? 360;
    const left = Math.min(Math.max(8, r.right - MENU_W), window.innerWidth - MENU_W - 8);
    const up = r.bottom + GAP + menuH > window.innerHeight - 8 && r.top - GAP - menuH > 8;
    setPos({ left, top: up ? r.top - GAP - menuH : r.bottom + GAP, up });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('resize', close);
    // Cualquier scroll mueve el botón: se cierra en vez de dejar el menú flotando fuera de sitio
    window.addEventListener('scroll', close, true);
    menuRef.current?.querySelector<HTMLElement>('button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  if (!canWrite) return null;

  const send = (intent: WaIntent) => {
    const link = waLink(phone, intent, ctx);
    setOpen(false);
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  };

  const host = typeof document !== 'undefined' ? btnRef.current?.closest('.portal-ui') || document.body : null;
  const who = firstName(name) || name;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Escribir a ${name} por WhatsApp`}
        title="Escribir por WhatsApp"
        className={cn(
          'inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[#1f7a3a]',
          variant === 'icon'
            ? 'w-8 h-8 rounded-full hover:bg-[#1f7a3a]/10'
            : 'h-9 px-3.5 rounded-full text-xs font-semibold border border-[#1f7a3a]/30 hover:bg-[#1f7a3a]/10',
          open && 'bg-[#1f7a3a]/10',
          className
        )}
      >
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
        {variant === 'button' && 'WhatsApp'}
      </button>

      {open &&
        host &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={`Escribir a ${name}`}
            style={{ position: 'fixed', zIndex: 120, width: MENU_W, top: pos?.top ?? -9999, left: pos?.left ?? -9999, visibility: pos ? 'visible' : 'hidden' }}
            className="rounded-2xl bg-[#ffffff] border border-[rgba(13,21,34,0.1)] shadow-[0_12px_32px_-8px_rgba(13,21,34,0.22)] p-1.5"
          >
            <p className="px-3 pt-2 pb-1.5 text-xs text-white/50">¿Para qué quieres escribir a {who}?</p>
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                role="menuitem"
                onClick={() => send(it.id)}
                className="w-full text-left rounded-xl px-3 py-2 hover:bg-black/[0.04] focus-visible:bg-black/[0.04] cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  {it.label}
                  {it.id === suggested && <span className="text-xs font-semibold text-[var(--signal)] bg-[var(--signal)]/10 rounded-full px-2 py-px">Recomendado</span>}
                </span>
                <span className="block text-xs text-white/50 mt-0.5">{it.hint}</span>
              </button>
            ))}
          </div>,
          host
        )}
    </>
  );
}
