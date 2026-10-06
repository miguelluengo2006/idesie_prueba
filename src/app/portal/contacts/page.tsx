'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Building2, Download, Loader2, Mail, Megaphone, Phone, Plus, Search, Trash2, Upload, UserPlus, Users } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { cn } from '@/lib/utils';
import { EmptyState, Page, Skeleton } from '@/components/portal/ui';
import Modal from '@/components/portal/Modal';
import TagInput from '@/components/portal/TagInput';
import { crm } from '@/components/portal/crmApi';
import { timeAgo } from '@/components/portal/leadMeta';
import {
  CONTACT_SOURCES,
  STATUS_LABEL,
  contactStatus,
  exportContactsCsv,
  matchesQuery,
  parseContactsCsv,
  tagCounts,
  type Contact,
  type ContactStatus,
  type ParsedImport,
} from '@/lib/contacts';

type StatusFilter = 'all' | ContactStatus;

const STATUS_BADGE: Record<ContactStatus, string> = {
  subscribed: 'bg-[var(--signal)]/15 text-[var(--signal)] border border-[var(--signal)]/30',
  'no-consent': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25',
  unsubscribed: 'bg-gray-800/30 text-gray-400 border border-gray-700',
};

const PAGE_SIZE = 100;

const fieldClass = 'w-full px-4 py-2.5 border border-[var(--portal-line-strong)] rounded-xl text-sm outline-none placeholder:text-white/30';
const labelClass = 'block text-xs uppercase tracking-widest text-white/40 mb-1.5';

/* ───────────── Alta y edición ───────────── */

function ContactModal({
  contact,
  suggestions,
  token,
  onClose,
  onSaved,
}: {
  contact: Contact | null;
  suggestions: string[];
  token: string | undefined;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const editing = !!contact;
  const [email, setEmail] = useState(contact?.email || '');
  const [name, setName] = useState(contact?.name || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [company, setCompany] = useState(contact?.company || '');
  const [tags, setTags] = useState<string[]>(contact?.tags || []);
  const [notes, setNotes] = useState(contact?.notes || '');
  const [subscribed, setSubscribed] = useState(contact ? contact.subscribed && !contact.unsubscribed_at : false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribed = !!contact?.unsubscribed_at;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (contact) {
        await crm(token, `/api/contacts/${contact.id}`, {
          method: 'PATCH',
          body: { name, phone, company, tags, notes, ...(unsubscribed ? {} : { subscribed }) },
        });
        onSaved('Contacto guardado');
      } else {
        await crm(token, '/api/contacts', { method: 'POST', body: { contacts: [{ email, name, phone, company, tags }], consent: subscribed } });
        onSaved('Contacto añadido');
      }
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!contact) return;
    setBusy(true);
    try {
      await crm(token, `/api/contacts/${contact.id}`, { method: 'DELETE' });
      onSaved('Contacto eliminado');
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={editing ? 'Editar contacto' : 'Nuevo contacto'} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label htmlFor="c-email" className={labelClass}>Email</label>
          <input id="c-email" type="email" required disabled={editing} value={email} onChange={(e) => setEmail(e.target.value)} className={cn(fieldClass, editing && 'opacity-60')} placeholder="nombre@empresa.com" autoFocus={!editing} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="c-name" className={labelClass}>Nombre</label>
            <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} placeholder="Nombre y apellidos" />
          </div>
          <div>
            <label htmlFor="c-phone" className={labelClass}>Teléfono</label>
            <input id="c-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} placeholder="+34 600 000 000" />
          </div>
        </div>
        <div>
          <label htmlFor="c-company" className={labelClass}>Empresa o centro</label>
          <input id="c-company" value={company} onChange={(e) => setCompany(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <span className={labelClass}>Etiquetas</span>
          <TagInput label="Añadir etiqueta" value={tags} onChange={setTags} suggestions={suggestions} placeholder="Alumno, Empresa, Máster BIM…" />
        </div>
        <div>
          <label htmlFor="c-notes" className={labelClass}>Notas</label>
          <textarea id="c-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${fieldClass} resize-none`} />
        </div>

        {unsubscribed ? (
          <p className="text-sm rounded-xl border border-white/10 px-4 py-3 text-white/60">
            Se dio de baja {contact?.unsubscribed_at ? timeAgo(contact.unsubscribed_at).toLowerCase() : ''}. No recibirá campañas y no se le puede volver a suscribir desde aquí.
          </p>
        ) : (
          <label className="flex items-start gap-3 text-sm text-white/70 cursor-pointer">
            <input type="checkbox" checked={subscribed} onChange={(e) => setSubscribed(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--signal)] cursor-pointer" />
            <span>
              Ha aceptado recibir emails de campañas.
              <span className="block text-xs text-white/40 mt-0.5">Marca solo si tienes su consentimiento. Sin esto no entra en los envíos masivos.</span>
            </span>
          </label>
        )}

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center justify-between gap-3 pt-2">
          {editing ? (
            confirmDelete ? (
              <span className="flex items-center gap-2 text-sm">
                ¿Borrar?
                <button type="button" onClick={remove} disabled={busy} className="px-3 h-9 rounded-full bg-red-500/90 text-white text-xs font-semibold cursor-pointer disabled:opacity-50">Sí, borrar</button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="px-3 h-9 rounded-full border border-white/15 text-xs cursor-pointer">No</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-red-400 transition-colors cursor-pointer">
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            )
          ) : (
            <span />
          )}
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 px-6 h-11 rounded-full portal-cta text-sm cursor-pointer disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} {editing ? 'Guardar' : 'Añadir contacto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ───────────── Importar CSV ───────────── */

function ImportModal({
  suggestions,
  token,
  onClose,
  onDone,
}: {
  suggestions: string[];
  token: string | undefined;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const [fileName, setFileName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.size > 5 * 1024 * 1024) return setError('El archivo es demasiado grande (máximo 5 MB).');
    setFileName(file.name);
    setParsed(parseContactsCsv(await file.text()));
  };

  const run = async () => {
    if (!parsed?.contacts.length) return;
    setBusy(true);
    setError(null);
    try {
      const r = await crm<{ created: number; updated: number }>(token, '/api/contacts', {
        method: 'POST',
        body: { contacts: parsed.contacts, source: 'import', consent, tags },
      });
      onDone(`Importación lista: ${r.created} nuevos y ${r.updated} actualizados`);
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title="Importar contactos" onClose={onClose} wide>
      <div className="space-y-5">
        <p className="text-sm text-white/60">
          Sube un archivo CSV (Excel → Guardar como CSV). Reconoce las columnas <b>email</b>, <b>nombre</b>, <b>teléfono</b>, <b>empresa</b> y <b>etiquetas</b>.
          Los que ya existan se actualizan sin duplicarse.
        </p>

        <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--portal-line-strong)] px-4 py-8 text-center cursor-pointer hover:bg-white/[0.03] transition-colors">
          <Upload className="w-6 h-6 text-[var(--signal)]" />
          <span className="text-sm font-medium">{fileName || 'Elige un archivo .csv'}</span>
          <input type="file" accept=".csv,.txt,text/csv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>

        {parsed && (
          <div className="rounded-2xl border border-white/10 p-4 space-y-3">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span><b className="tabular-nums">{parsed.contacts.length}</b> contactos válidos</span>
              {parsed.invalid > 0 && <span className="text-yellow-400"><b className="tabular-nums">{parsed.invalid}</b> sin email válido (se saltan)</span>}
              {parsed.duplicates > 0 && <span className="text-white/50"><b className="tabular-nums">{parsed.duplicates}</b> repetidos (se fusionan)</span>}
            </div>
            {parsed.contacts.length > 0 ? (
              <ul className="text-xs text-white/55 space-y-1">
                {parsed.contacts.slice(0, 4).map((c) => (
                  <li key={c.email} className="truncate">{[c.name, c.email, c.company].filter(Boolean).join(' · ')}</li>
                ))}
                {parsed.contacts.length > 4 && <li>… y {parsed.contacts.length - 4} más</li>}
              </ul>
            ) : (
              <p className="text-sm text-red-400">No hemos encontrado ningún email válido. Revisa que el archivo tenga una columna «email».</p>
            )}
          </div>
        )}

        {parsed && parsed.contacts.length > 0 && (
          <>
            <div>
              <span className={labelClass}>Etiquetas para todos los importados</span>
              <TagInput label="Etiquetas de la importación" value={tags} onChange={setTags} suggestions={suggestions} placeholder="Ej.: Feria 2026, Antiguos alumnos" />
            </div>
            <label className="flex items-start gap-3 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--signal)] cursor-pointer" />
              <span>
                Confirmo que estas personas han aceptado recibir emails de IDESIE.
                <span className="block text-xs text-white/40 mt-0.5">
                  Si no lo marcas se importan igualmente, pero sin consentimiento: no recibirán campañas. Enviar emails comerciales sin consentimiento incumple el RGPD y la LSSI.
                </span>
              </span>
            </label>
          </>
        )}

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={run}
            disabled={busy || !parsed?.contacts.length}
            className="inline-flex items-center gap-2 px-6 h-11 rounded-full portal-cta text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Importar {parsed?.contacts.length ? `${parsed.contacts.length} contactos` : ''}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── Página ───────────── */

export default function ContactsPage() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [modal, setModal] = useState<'new' | 'import' | { contact: Contact } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((text: string, ok = true) => {
    setToast({ ok, text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await crm<{ contacts: Contact[] }>(token, '/api/contacts');
      setContacts(data.contacts);
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const tags = useMemo(() => tagCounts(contacts), [contacts]);
  const counts = useMemo(() => {
    const c = { all: contacts.length, subscribed: 0, 'no-consent': 0, unsubscribed: 0 };
    for (const x of contacts) c[contactStatus(x)] += 1;
    return c;
  }, [contacts]);

  const filtered = useMemo(
    () =>
      contacts.filter(
        (c) =>
          (status === 'all' || contactStatus(c) === status) &&
          (!tag || c.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) &&
          matchesQuery(c, query)
      ),
    [contacts, status, tag, query]
  );

  useEffect(() => setVisible(PAGE_SIZE), [status, tag, query]);

  const afterChange = async (message: string) => {
    setModal(null);
    say(message);
    await load();
  };

  const syncLeads = async () => {
    setSyncing(true);
    try {
      const r = await crm<{ created: number; updated: number; leads: number }>(token, '/api/contacts/sync-leads', { method: 'POST' });
      say(r.leads === 0 ? 'No hay leads con email que importar' : `Leads importados: ${r.created} nuevos y ${r.updated} ya existían`);
      await load();
    } catch (err: any) {
      say(err.message, false);
    } finally {
      setSyncing(false);
    }
  };

  const actions = (
    <>
      <button onClick={() => setModal('import')} className="flex items-center gap-1.5 px-3 h-9 border border-white/15 hover:border-[var(--portal-line-strong)] text-white/70 hover:text-white rounded-full text-xs font-medium transition-colors cursor-pointer" aria-label="Importar contactos">
        <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Importar</span>
      </button>
      {contacts.length > 0 && (
        <button onClick={() => exportContactsCsv(filtered)} aria-label="Exportar CSV" className="hidden md:flex items-center gap-1.5 px-3 h-9 border border-white/15 hover:border-[var(--portal-line-strong)] text-white/70 hover:text-white rounded-full text-xs font-medium transition-colors cursor-pointer">
          <Download className="w-4 h-4" /> Exportar
        </button>
      )}
      <button onClick={() => setModal('new')} className="flex items-center gap-1.5 px-4 h-9 rounded-full portal-cta text-xs font-semibold cursor-pointer">
        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nuevo contacto</span><span className="sm:hidden">Nuevo</span>
      </button>
    </>
  );

  if (loading) {
    return (
      <Page title="Contactos">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </Page>
    );
  }

  if (loadError) {
    return (
      <Page title="Contactos">
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No se pudieron cargar los contactos"
          text={`${loadError} Si es la primera vez, ejecuta la migración migrations/add-crm.sql en Supabase (SQL Editor).`}
          action={<button onClick={() => { setLoading(true); load(); }} className="px-5 h-10 rounded-full portal-cta text-sm cursor-pointer">Reintentar</button>}
        />
      </Page>
    );
  }

  return (
    <Page title="Contactos" subtitle={`${contacts.length} en total`} actions={actions}>
      {toast && (
        <p role="status" className={cn('text-sm rounded-2xl border px-4 py-3', toast.ok ? 'border-[var(--signal)]/30 bg-[var(--signal)]/10' : 'border-red-500/30 bg-red-500/10 text-red-400')}>
          {toast.text}
        </p>
      )}

      {contacts.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="Aún no hay contactos"
          text="Aquí estará tu agenda: alumnos, empresas y leads. Cada persona que te escriba desde la web entrará sola. También puedes importar un CSV o traer los leads que ya tienes."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={() => setModal('import')} className="inline-flex items-center gap-2 px-5 h-10 rounded-full portal-cta text-sm cursor-pointer"><Upload className="w-4 h-4" /> Importar CSV</button>
              <button onClick={syncLeads} disabled={syncing} className="inline-flex items-center gap-2 px-5 h-10 rounded-full border border-white/15 hover:border-[var(--portal-line-strong)] text-sm cursor-pointer disabled:opacity-60">
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Traer mis leads
              </button>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {([
              { v: 'all', label: 'Todos', hint: 'Toda tu agenda' },
              { v: 'subscribed', label: 'Suscritos', hint: 'Reciben campañas' },
              { v: 'no-consent', label: 'Sin consentimiento', hint: 'No reciben campañas' },
              { v: 'unsubscribed', label: 'De baja', hint: 'Pidieron no recibir más' },
            ] as const).map((k, i) => (
              <button
                key={k.v}
                onClick={() => setStatus(status === k.v ? 'all' : k.v)}
                aria-pressed={status === k.v}
                className={cn('card-liquid rounded-3xl p-4 text-left cursor-pointer pn-in', status === k.v && k.v !== 'all' && 'shadow-[0_0_0_2px_var(--signal),0_0_30px_-8px_var(--signal)]')}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="pn-title mb-1.5">{k.label}</div>
                <div className="text-2xl md:text-3xl font-semibold tabular-nums">{counts[k.v]}</div>
                <div className="text-xs text-white/45 mt-0.5 truncate">{k.hint}</div>
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
            <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1">
              <button onClick={() => setTag(null)} aria-pressed={tag === null} className="pn-chip">Todas las etiquetas</button>
              {tags.slice(0, 12).map((t) => (
                <button key={t.tag} onClick={() => setTag(tag?.toLowerCase() === t.tag.toLowerCase() ? null : t.tag)} aria-pressed={tag?.toLowerCase() === t.tag.toLowerCase()} className="pn-chip">
                  {t.tag} <span className="tabular-nums text-white/35">{t.count}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-white/35 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar nombre, email, empresa…"
                aria-label="Buscar contactos"
                className="w-full lg:w-72 pl-10 pr-3 py-2.5 border border-[var(--portal-line-strong)] rounded-full text-sm outline-none placeholder:text-white/30"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<Search className="w-6 h-6" />} title="Nada coincide" text="Prueba con otros filtros o borra la búsqueda." />
          ) : (
            <>
              <ul className="space-y-2">
                {filtered.slice(0, visible).map((c) => {
                  const st = contactStatus(c);
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => setModal({ contact: c })}
                        className="card-liquid card-liquid-interactive rounded-2xl w-full text-left px-4 py-3 flex items-center gap-4 cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold truncate">{c.name || c.email}</span>
                            <span className={cn('px-2 py-0.5 text-[11px] rounded-full shrink-0', STATUS_BADGE[st])}>{STATUS_LABEL[st]}</span>
                          </div>
                          <div className="flex items-center gap-x-3 gap-y-0.5 text-xs text-white/50 mt-1 flex-wrap">
                            {c.name && <span className="flex items-center gap-1 truncate max-w-[240px]"><Mail className="w-3 h-3 shrink-0" />{c.email}</span>}
                            {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{c.phone}</span>}
                            {c.company && <span className="flex items-center gap-1 truncate"><Building2 className="w-3 h-3 shrink-0" />{c.company}</span>}
                          </div>
                          {c.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {c.tags.slice(0, 5).map((t) => <span key={t} className="px-2 py-0.5 text-[11px] rounded-full border border-white/12 text-white/60">{t}</span>)}
                              {c.tags.length > 5 && <span className="text-[11px] text-white/40 self-center">+{c.tags.length - 5}</span>}
                            </div>
                          )}
                        </div>
                        <div className="hidden sm:block text-right shrink-0 text-[11px] text-white/40">
                          <div>{CONTACT_SOURCES[c.source] || c.source}</div>
                          <div>{timeAgo(c.created_at)}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {filtered.length > visible && (
                <div className="text-center">
                  <button onClick={() => setVisible((v) => v + PAGE_SIZE)} className="px-5 h-10 rounded-full border border-white/15 hover:border-[var(--portal-line-strong)] text-sm cursor-pointer">
                    Mostrar más ({filtered.length - visible} restantes)
                  </button>
                </div>
              )}
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-white/50">
            <button onClick={syncLeads} disabled={syncing} className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer disabled:opacity-60">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Traer los leads que aún no están aquí
            </button>
            <Link href="/portal/campaigns" className="inline-flex items-center gap-2 text-[var(--signal)] hover:underline">
              <Megaphone className="w-4 h-4" /> Crear una campaña de email
            </Link>
          </div>
        </>
      )}

      {modal === 'new' && <ContactModal contact={null} suggestions={tags.map((t) => t.tag)} token={token} onClose={() => setModal(null)} onSaved={afterChange} />}
      {modal && typeof modal === 'object' && (
        <ContactModal contact={modal.contact} suggestions={tags.map((t) => t.tag)} token={token} onClose={() => setModal(null)} onSaved={afterChange} />
      )}
      {modal === 'import' && <ImportModal suggestions={tags.map((t) => t.tag)} token={token} onClose={() => setModal(null)} onDone={afterChange} />}
    </Page>
  );
}
