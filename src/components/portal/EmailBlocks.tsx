'use client';

import { useState } from 'react';
import { Heading1, ImageIcon, LayoutTemplate, List, Minus, MousePointerClick } from 'lucide-react';
import Modal from '@/components/portal/Modal';
import { buildBlock, type BlockKind } from '@/lib/campaignTemplates';

const fieldClass = 'w-full px-4 py-2.5 border border-[var(--portal-line-strong)] rounded-xl text-sm outline-none placeholder:text-white/30';
const labelClass = 'block text-xs uppercase tracking-widest text-white/40 mb-1.5';

const TOOLS: { kind: BlockKind; label: string; icon: React.ReactNode; asks: boolean }[] = [
  { kind: 'heading', label: 'Título', icon: <Heading1 className="w-3.5 h-3.5" />, asks: false },
  { kind: 'image', label: 'Imagen', icon: <ImageIcon className="w-3.5 h-3.5" />, asks: true },
  { kind: 'button', label: 'Botón', icon: <MousePointerClick className="w-3.5 h-3.5" />, asks: true },
  { kind: 'list', label: 'Lista', icon: <List className="w-3.5 h-3.5" />, asks: false },
  { kind: 'divider', label: 'Separador', icon: <Minus className="w-3.5 h-3.5" />, asks: false },
];

/** Barra de bloques del editor: inserta títulos, imágenes, botones, listas y separadores donde está el cursor. */
export default function EmailBlocks({ onInsert, onOpenTemplates }: { onInsert: (block: string) => void; onOpenTemplates: () => void }) {
  const [asking, setAsking] = useState<'image' | 'button' | null>(null);

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Insertar bloques en el email">
        <button type="button" onClick={onOpenTemplates} className="pn-chip inline-flex items-center gap-1.5">
          <LayoutTemplate className="w-3.5 h-3.5" /> Plantillas
        </button>
        <span className="w-px h-5 bg-white/10 mx-1" aria-hidden />
        {TOOLS.map((t) => (
          <button
            key={t.kind}
            type="button"
            onClick={() => (t.asks ? setAsking(t.kind as 'image' | 'button') : onInsert(buildBlock(t.kind)))}
            className="pn-chip inline-flex items-center gap-1.5"
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {asking && (
        <BlockForm
          kind={asking}
          onClose={() => setAsking(null)}
          onSubmit={(block) => {
            onInsert(block);
            setAsking(null);
          }}
        />
      )}
    </>
  );
}

function BlockForm({ kind, onClose, onSubmit }: { kind: 'image' | 'button'; onClose: () => void; onSubmit: (block: string) => void }) {
  const isButton = kind === 'button';
  const [text, setText] = useState('');
  const [url, setUrl] = useState('https://');
  const [outline, setOutline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = url.trim();
    if (isButton && !text.trim()) return setError('Escribe lo que dirá el botón.');
    if (isButton && !/^(https?:\/\/|mailto:)\S+$/i.test(clean)) return setError('El enlace debe empezar por https:// (o mailto:).');
    if (!isButton && !/^https:\/\/\S+$/i.test(clean)) return setError('La imagen debe estar en una dirección https:// pública.');
    onSubmit(buildBlock(kind, { text, url: clean, outline }));
  };

  return (
    <Modal title={isButton ? 'Insertar botón' : 'Insertar imagen'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="blk-text" className={labelClass}>{isButton ? 'Texto del botón' : 'Descripción (para quien no ve la imagen)'}</label>
          <input id="blk-text" autoFocus value={text} onChange={(e) => setText(e.target.value)} className={fieldClass} placeholder={isButton ? 'Ej.: Reservar mi plaza' : 'Ej.: Aula del máster'} maxLength={80} />
        </div>
        <div>
          <label htmlFor="blk-url" className={labelClass}>{isButton ? 'Adónde lleva' : 'Dirección de la imagen'}</label>
          <input id="blk-url" type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} className={fieldClass} placeholder="https://idesie.com/…" />
          {!isButton && <p className="text-xs text-white/45 mt-1.5">Súbela antes a tu web o a un alojamiento de imágenes y pega aquí su dirección. Anchura ideal: 1072 px.</p>}
        </div>
        {isButton && (
          <fieldset>
            <legend className={labelClass}>Estilo</legend>
            <div className="flex gap-2">
              {[
                { v: false, label: 'Relleno', hint: 'Acción principal' },
                { v: true, label: 'Con borde', hint: 'Acción secundaria' },
              ].map((o) => (
                <label key={o.label} className={`flex-1 rounded-xl border px-4 py-2.5 cursor-pointer text-sm ${outline === o.v ? 'border-[var(--signal)] bg-[var(--signal)]/10' : 'border-[var(--portal-line-strong)]'}`}>
                  <input type="radio" name="blk-style" checked={outline === o.v} onChange={() => setOutline(o.v)} className="sr-only" />
                  <span className="font-medium">{o.label}</span>
                  <span className="block text-xs text-white/45">{o.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-5 h-10 rounded-full border border-white/15 text-sm cursor-pointer">Cancelar</button>
          <button type="submit" className="px-6 h-10 rounded-full portal-cta text-sm cursor-pointer">Insertar</button>
        </div>
      </form>
    </Modal>
  );
}
