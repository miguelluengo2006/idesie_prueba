'use client';

import { useId, useState } from 'react';
import { X } from 'lucide-react';
import { normalizeTags } from '@/lib/contacts';

/** Etiquetas como fichas: se añaden con Enter o coma y se quitan con la X. Sugiere las que ya existen. */
export default function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Escribe y pulsa Enter',
  label,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  label: string;
}) {
  const [draft, setDraft] = useState('');
  const listId = useId();

  const commit = () => {
    if (!draft.trim()) return;
    onChange(normalizeTags([...value, draft]));
    setDraft('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => (
          <span key={tag} className="pn-chip" aria-pressed="true">
            {tag}
            <button
              type="button"
              aria-label={`Quitar la etiqueta ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="ml-1 -mr-1 opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        list={listId}
        aria-label={label}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          if (v.endsWith(',')) {
            onChange(normalizeTags([...value, v]));
            setDraft('');
          } else setDraft(v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={commit}
        className="w-full px-4 py-2.5 border border-[var(--portal-line-strong)] rounded-xl text-sm outline-none placeholder:text-white/30"
      />
      <datalist id={listId}>
        {suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())).map((s) => <option key={s} value={s} />)}
      </datalist>
    </div>
  );
}
