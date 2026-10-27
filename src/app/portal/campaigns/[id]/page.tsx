'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CheckCircle2, Copy, Loader2, Send, Trash2, Users } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { cn } from '@/lib/utils';
import { EmptyState, Page, Skeleton } from '@/components/portal/ui';
import Modal from '@/components/portal/Modal';
import EmailBlocks from '@/components/portal/EmailBlocks';
import TemplatePicker from '@/components/portal/TemplatePicker';
import CampaignResults from '@/components/portal/CampaignResults';
import { crm } from '@/components/portal/crmApi';
import { CAMPAIGN_BADGE } from '@/components/portal/campaignMeta';
import {
  CAMPAIGN_STATUS_LABEL,
  CAMPAIGN_VARIABLES,
  MAX_BODY_LENGTH,
  MAX_SUBJECT_LENGTH,
  campaignProblems,
  receivedEmails,
  renderCampaignEmail,
  withoutReceived,
  type Campaign,
  type CampaignHistory,
} from '@/lib/campaigns';
import { contactStatus, inAudience, tagCounts, type Contact } from '@/lib/contacts';
import { insertBlock } from '@/lib/campaignTemplates';

const fieldClass = 'w-full px-4 py-2.5 border border-[var(--portal-line-strong)] rounded-xl text-sm outline-none placeholder:text-white/30';
const labelClass = 'block text-xs uppercase tracking-widest text-white/40 mb-1.5';

interface Progress {
  sent: number;
  failed: number;
  pending: number;
  total: number;
}

export default function CampaignEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const token = session?.access_token;
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [failures, setFailures] = useState<{ email: string; error: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Campos editables
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audienceTags, setAudienceTags] = useState<string[]>([]);
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [history, setHistory] = useState<CampaignHistory | null>(null);
  const [dirty, setDirty] = useState(false);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const sendingRef = useRef(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const apply = useCallback((c: Campaign) => {
    setCampaign(c);
    setName(c.name);
    setSubject(c.subject);
    setBody(c.body);
    setAudienceTags(c.audience_tags);
    setExcludeIds(c.exclude_campaign_ids || []);
    setDirty(false);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [c, list, past] = await Promise.all([
        crm<{ campaign: Campaign; failures: { email: string; error: string | null }[] }>(token, `/api/campaigns/${id}`),
        crm<{ contacts: Contact[] }>(token, '/api/contacts'),
        // El historial es un extra: si falla, el editor sigue funcionando sin «No repetir»
        crm<CampaignHistory>(token, '/api/campaigns/history').catch(() => null),
      ]);
      setHistory(past);
      apply(c.campaign);
      setFailures(c.failures);
      setContacts(list.contacts);
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, id, apply]);

  useEffect(() => {
    load();
  }, [load]);

  const tags = useMemo(() => tagCounts(contacts), [contacts]);
  const alreadyReceived = useMemo(() => (history ? receivedEmails(history.received, excludeIds) : new Set<string>()), [history, excludeIds]);
  const inAudienceNow = useMemo(() => contacts.filter((c) => inAudience(c, audienceTags)), [contacts, audienceTags]);
  const recipients = useMemo(() => withoutReceived(inAudienceNow, alreadyReceived), [inAudienceNow, alreadyReceived]);
  const repeatsAvoided = inAudienceNow.length - recipients.length;
  const pastCampaigns = useMemo(() => (history?.campaigns || []).filter((c) => c.id !== id), [history, id]);
  const excluded = useMemo(() => {
    const inTag = (c: Contact) => !audienceTags.length || c.tags.some((t) => audienceTags.some((a) => a.toLowerCase() === t.toLowerCase()));
    const pool = contacts.filter(inTag);
    return {
      noConsent: pool.filter((c) => contactStatus(c) === 'no-consent').length,
      unsubscribed: pool.filter((c) => contactStatus(c) === 'unsubscribed').length,
    };
  }, [contacts, audienceTags]);

  const isDraft = campaign?.status === 'draft';
  const problems = campaignProblems({ subject, body }, recipients.length);

  // Vista previa: tal cual saldrá, con el primer destinatario como ejemplo
  const preview = useMemo(() => {
    const sample = recipients[0];
    return renderCampaignEmail({
      subject,
      body: body || 'El texto de tu email aparecerá aquí.',
      recipient: { email: sample?.email || 'nombre@ejemplo.com', name: sample?.name || 'Ana García', company: sample?.company || 'Empresa de ejemplo' },
      unsubscribeUrl: '#',
    });
  }, [subject, body, recipients]);

  const say = (text: string, ok = true) => setNotice({ ok, text });

  const save = useCallback(async (): Promise<boolean> => {
    if (!isDraft) return true;
    setSaving(true);
    try {
      const { campaign: c } = await crm<{ campaign: Campaign }>(token, `/api/campaigns/${id}`, {
        method: 'PATCH',
        body: { name, subject, body, audience_tags: audienceTags, exclude_campaign_ids: excludeIds },
      });
      setCampaign(c);
      setDirty(false);
      return true;
    } catch (err: any) {
      say(err.message, false);
      return false;
    } finally {
      setSaving(false);
    }
  }, [isDraft, token, id, name, subject, body, audienceTags, excludeIds]);

  const sendTest = async () => {
    setTesting(true);
    setNotice(null);
    try {
      if (!(await save())) return;
      const r = await crm<{ to: string }>(token, `/api/campaigns/${id}/send`, { method: 'POST', body: { test: true } });
      say(`Prueba enviada a ${r.to}. Revisa tu bandeja (y el spam).`);
    } catch (err: any) {
      say(err.message, false);
    } finally {
      setTesting(false);
    }
  };

  // Envía lote a lote hasta que no queda nadie; si se corta, «Continuar» sigue donde iba
  const runSend = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setConfirmSend(false);
    setSendError(null);
    setNotice(null);
    try {
      if (!(await save())) return;
      setProgress({ sent: 0, failed: 0, pending: recipients.length, total: recipients.length });
      for (;;) {
        const r = await crm<{ status: 'sending' | 'sent'; total: number; sent: number; failed: number; pending: number }>(
          token,
          `/api/campaigns/${id}/send`,
          { method: 'POST', body: {} }
        );
        setProgress({ sent: r.sent, failed: r.failed, pending: r.pending, total: r.total });
        if (r.status === 'sent') break;
      }
      await load();
      setProgress(null);
      say('Campaña enviada.');
    } catch (err: any) {
      setSendError(err.message);
      await load();
    } finally {
      sendingRef.current = false;
    }
  };

  const duplicate = async () => {
    if (!campaign) return;
    try {
      const { campaign: copy } = await crm<{ campaign: Campaign }>(token, '/api/campaigns', { method: 'POST', body: { name: `${campaign.name} (copia)` } });
      await crm(token, `/api/campaigns/${copy.id}`, { method: 'PATCH', body: { subject: campaign.subject, body: campaign.body, audience_tags: campaign.audience_tags, exclude_campaign_ids: [...new Set([...(campaign.exclude_campaign_ids || []), campaign.id])] } });
      router.push(`/portal/campaigns/${copy.id}`);
    } catch (err: any) {
      say(err.message, false);
    }
  };

  const remove = async () => {
    try {
      await crm(token, `/api/campaigns/${id}`, { method: 'DELETE' });
      router.push('/portal/campaigns');
    } catch (err: any) {
      setConfirmDelete(false);
      say(err.message, false);
    }
  };

  const insertVariable = (key: string) => {
    const el = bodyRef.current;
    const snippet = `{{${key}}}`;
    if (!el) {
      setBody((b) => b + snippet);
    } else {
      const { selectionStart: a, selectionEnd: b } = el;
      setBody(body.slice(0, a) + snippet + body.slice(b));
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(a + snippet.length, a + snippet.length);
      });
    }
    setDirty(true);
  };

  // Los bloques (título, botón, imagen…) se insertan en su propio párrafo donde está el cursor
  const insertAtCursor = (block: string) => {
    const el = bodyRef.current;
    const at = el ? el.selectionEnd : body.length;
    const next = insertBlock(body, block, at);
    setBody(next.body);
    setDirty(true);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(next.cursor, next.cursor);
    });
  };

  const toggleExclude = (cid: string) => {
    setExcludeIds(excludeIds.includes(cid) ? excludeIds.filter((x) => x !== cid) : [...excludeIds, cid]);
    setDirty(true);
  };

  const toggleTag = (tag: string) => {
    const has = audienceTags.some((t) => t.toLowerCase() === tag.toLowerCase());
    setAudienceTags(has ? audienceTags.filter((t) => t.toLowerCase() !== tag.toLowerCase()) : [...audienceTags, tag]);
    setDirty(true);
  };

  const back = (
    <Link href="/portal/campaigns" className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition-colors">
      <ArrowLeft className="w-3.5 h-3.5" /> Campañas
    </Link>
  );

  if (loading) {
    return (
      <Page title="Campaña">
        <Skeleton className="h-96" />
      </Page>
    );
  }

  if (loadError || !campaign) {
    return (
      <Page title="Campaña" actions={back}>
        <EmptyState icon={<AlertTriangle className="w-6 h-6" />} title="No se pudo abrir la campaña" text={loadError || 'No existe o no es tuya.'} />
      </Page>
    );
  }

  const sending = !!progress || sendingRef.current;
  const interrupted = campaign.status === 'sending' && !sending;
  const pct = progress && progress.total ? Math.round(((progress.sent + progress.failed) / progress.total) * 100) : 0;

  return (
    <Page
      title={campaign.name}
      subtitle={CAMPAIGN_STATUS_LABEL[campaign.status]}
      width="max-w-[1400px]"
      actions={
        <>
          {back}
          <span className={cn('px-2.5 py-1 text-[11px] rounded-full', CAMPAIGN_BADGE[campaign.status])}>{CAMPAIGN_STATUS_LABEL[campaign.status]}</span>
        </>
      }
    >
      {notice && (
        <p role="status" className={cn('text-sm rounded-2xl border px-4 py-3', notice.ok ? 'border-[var(--signal)]/30 bg-[var(--signal)]/10' : 'border-red-500/30 bg-red-500/10 text-red-400')}>
          {notice.text}
        </p>
      )}

      {/* Progreso del envío */}
      {(progress || interrupted) && (
        <section className="card-liquid rounded-3xl p-5 space-y-3" aria-live="polite">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold flex items-center gap-2">
              {sending && <Loader2 className="w-4 h-4 animate-spin text-[var(--signal)]" />}
              {sending ? 'Enviando…' : 'Envío a medias'}
            </span>
            <span className="tabular-nums text-white/60">
              {progress ? `${progress.sent} enviados · ${progress.failed} fallidos · ${progress.pending} pendientes` : `${campaign.sent_count} de ${campaign.total} enviados`}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.08] overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-[var(--signal)] transition-[width] duration-500" style={{ width: `${progress ? pct : campaign.total ? Math.round(((campaign.sent_count + campaign.failed_count) / campaign.total) * 100) : 0}%` }} />
          </div>
          {sending && <p className="text-xs text-white/45">No cierres esta página hasta que termine. Si se corta, vuelve aquí y pulsa «Continuar envío».</p>}
          {sendError && <p role="alert" className="text-sm text-red-400">{sendError}</p>}
          {!sending && (
            <button onClick={runSend} className="inline-flex items-center gap-2 px-5 h-10 rounded-full portal-cta text-sm cursor-pointer">
              <Send className="w-4 h-4" /> Continuar envío
            </button>
          )}
        </section>
      )}

      {!isDraft && !progress && !interrupted && (
        <section className="card-liquid rounded-3xl p-5 md:p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-[var(--signal)] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">Campaña enviada</h2>
              <p className="text-sm text-white/60 mt-1 tabular-nums">
                <b>{campaign.sent_count}</b> enviados de {campaign.total}
                {campaign.failed_count > 0 && <span className="text-red-400"> · {campaign.failed_count} fallidos</span>}
                {campaign.sent_at && <span> · {new Date(campaign.sent_at).toLocaleString('es-ES')}</span>}
              </p>
              {failures.length > 0 && (
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-white/70">Ver los que han fallado</summary>
                  <ul className="mt-2 space-y-1 text-xs text-white/55">
                    {failures.map((f) => <li key={f.email}><b>{f.email}</b> — {f.error || 'error de envío'}</li>)}
                  </ul>
                </details>
              )}
            </div>
            <button onClick={duplicate} className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full border border-white/15 hover:border-[var(--portal-line-strong)] text-xs font-medium cursor-pointer shrink-0">
              <Copy className="w-3.5 h-3.5" /> Duplicar
            </button>
          </div>
        </section>
      )}

      {!isDraft && !interrupted && <CampaignResults token={token} campaignId={id} sentAt={campaign.sent_at} />}

      <div className="grid xl:grid-cols-[1fr_1fr] gap-5 items-start">
        {/* Editor */}
        <section className="card-liquid rounded-3xl p-5 md:p-6 space-y-5">
          <div>
            <label htmlFor="cp-name" className={labelClass}>Nombre interno</label>
            <input id="cp-name" value={name} disabled={!isDraft} onChange={(e) => { setName(e.target.value); setDirty(true); }} className={fieldClass} placeholder="Ej.: Novedades Máster BIM octubre" />
          </div>
          <div>
            <label htmlFor="cp-subject" className={labelClass}>
              Asunto <span className="normal-case tracking-normal text-white/30">({subject.length}/{MAX_SUBJECT_LENGTH})</span>
            </label>
            <input id="cp-subject" value={subject} disabled={!isDraft} maxLength={MAX_SUBJECT_LENGTH} onChange={(e) => { setSubject(e.target.value); setDirty(true); }} className={fieldClass} placeholder="Lo primero que verán en su bandeja" />
          </div>
          <div>
            <div className="flex items-end justify-between gap-3 mb-1.5">
              <label htmlFor="cp-body" className="block text-xs uppercase tracking-widest text-white/40">Texto del email</label>
              {isDraft && (
                <div className="flex items-center gap-1.5">
                  {CAMPAIGN_VARIABLES.map((v) => (
                    <button key={v.key} type="button" onClick={() => insertVariable(v.key)} className="pn-chip" title={`Inserta {{${v.key}}}`}>
                      + {v.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isDraft && (
              <div className="mb-2">
                <EmailBlocks onInsert={insertAtCursor} onOpenTemplates={() => setShowTemplates(true)} />
              </div>
            )}
            <textarea
              id="cp-body"
              ref={bodyRef}
              rows={14}
              value={body}
              disabled={!isDraft}
              maxLength={MAX_BODY_LENGTH}
              onChange={(e) => { setBody(e.target.value); setDirty(true); }}
              className={`${fieldClass} font-mono leading-relaxed resize-y`}
              placeholder={'Hola {{nombre|}},\n\nTe contamos las novedades del Máster BIM…\n\n[[Ver el programa|https://idesie.com/#formacion]]'}
            />
            <details className="mt-2 text-xs text-white/45">
              <summary className="cursor-pointer hover:text-white/70">Cómo dar formato</summary>
              <ul className="mt-2 space-y-1 leading-relaxed">
                <li>Deja una línea en blanco entre párrafos. Un salto de línea simple se respeta.</li>
                <li><code>**negrita**</code> · <code>[texto del enlace](https://…)</code> · listas con <code>- </code> al inicio de cada línea.</li>
                <li>Cada bloque va en su propio párrafo: <code># Título</code> · <code>![descripción](https://…/imagen.jpg)</code> · <code>---</code> (separador).</li>
                <li>Botón: <code>[[Texto del botón|https://…]]</code>, o <code>[[Texto|https://…|outline]]</code> con borde. Uno por párrafo.</li>
                <li><code>{'{{nombre}}'}</code> y <code>{'{{empresa}}'}</code> se sustituyen por los datos de cada contacto. <code>{'{{nombre|amigo}}'}</code> usa «amigo» si no hay nombre.</li>
                <li>El pie con tus datos y el enlace para darse de baja se añade solo.</li>
              </ul>
            </details>
          </div>

          <div>
            <span className={labelClass}>Audiencia</span>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button type="button" disabled={!isDraft} onClick={() => { setAudienceTags([]); setDirty(true); }} aria-pressed={audienceTags.length === 0} className="pn-chip">Todos los suscritos</button>
              {tags.map((t) => (
                <button key={t.tag} type="button" disabled={!isDraft} onClick={() => toggleTag(t.tag)} aria-pressed={audienceTags.some((a) => a.toLowerCase() === t.tag.toLowerCase())} className="pn-chip">
                  {t.tag} <span className="tabular-nums text-white/35">{t.count}</span>
                </button>
              ))}
            </div>
            <p className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--signal)]" />
              <b className="tabular-nums">{isDraft ? recipients.length : campaign.total}</b> {(isDraft ? recipients.length : campaign.total) === 1 ? 'destinatario' : 'destinatarios'}
            </p>
            {isDraft && repeatsAvoided > 0 && (
              <p className="text-xs text-white/45 mt-1.5">{repeatsAvoided} {repeatsAvoided === 1 ? 'contacto no lo recibirá' : 'contactos no lo recibirán'} porque ya recibieron una campaña anterior.</p>
            )}
            {isDraft && (excluded.noConsent > 0 || excluded.unsubscribed > 0) && (
              <p className="text-xs text-white/45 mt-1.5">
                No reciben este email: {excluded.noConsent > 0 && `${excluded.noConsent} sin consentimiento`}
                {excluded.noConsent > 0 && excluded.unsubscribed > 0 && ' y '}
                {excluded.unsubscribed > 0 && `${excluded.unsubscribed} dados de baja`}.
              </p>
            )}
          </div>

          {(isDraft ? pastCampaigns.length > 0 : excludeIds.length > 0) && (
            <div>
              <span className={labelClass}>No repetir</span>
              <p className="text-xs text-white/45 mb-2">
                {isDraft ? 'No se enviará a quien ya haya recibido las campañas que marques.' : 'No se envió a quien ya había recibido estas campañas.'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pastCampaigns
                  .filter((c) => isDraft || excludeIds.includes(c.id))
                  .map((c) => (
                    <button key={c.id} type="button" disabled={!isDraft} onClick={() => toggleExclude(c.id)} aria-pressed={excludeIds.includes(c.id)} className="pn-chip max-w-full" title={c.sent_at ? `Enviada el ${new Date(c.sent_at).toLocaleDateString('es-ES')}` : undefined}>
                      <span className="truncate">{c.name}</span> <span className="tabular-nums text-white/35">{c.sent_count}</span>
                    </button>
                  ))}
              </div>
              {isDraft && pastCampaigns.length > 1 && (
                <button type="button" onClick={() => { setExcludeIds(excludeIds.length === pastCampaigns.length ? [] : pastCampaigns.map((c) => c.id)); setDirty(true); }} className="mt-2 text-xs text-[var(--signal)] hover:underline cursor-pointer">
                  {excludeIds.length === pastCampaigns.length ? 'Quitar todas' : 'Marcar todas'}
                </button>
              )}
            </div>
          )}

          {isDraft && (
            <div className="space-y-3 pt-1">
              {problems.length > 0 && (subject || body) && (
                <ul className="text-xs text-yellow-400 space-y-0.5">
                  {problems.map((p) => <li key={p}>• {p}</li>)}
                </ul>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => save().then((ok) => ok && say('Borrador guardado'))} disabled={saving || !dirty} className="px-5 h-10 rounded-full border border-white/15 hover:border-[var(--portal-line-strong)] text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} {dirty ? 'Guardar borrador' : 'Guardado'}
                </button>
                <button onClick={sendTest} disabled={testing || sending || !subject.trim() || !body.trim()} className="px-5 h-10 rounded-full border border-white/15 hover:border-[var(--portal-line-strong)] text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2">
                  {testing && <Loader2 className="w-4 h-4 animate-spin" />} Enviarme una prueba
                </button>
                <button onClick={() => setConfirmSend(true)} disabled={problems.length > 0 || sending} className="px-6 h-10 rounded-full portal-cta text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 ml-auto">
                  <Send className="w-4 h-4" /> Enviar campaña
                </button>
              </div>
            </div>
          )}

          <div className="pt-1 border-t border-white/10">
            <button onClick={() => setConfirmDelete(true)} disabled={campaign.status === 'sending'} className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-40">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar campaña
            </button>
          </div>
        </section>

        {/* Vista previa */}
        <section className="card-liquid rounded-3xl p-5 md:p-6 xl:sticky xl:top-2">
          <div className="pn-title mb-1">Vista previa</div>
          <p className="text-xs text-white/45 mb-3 truncate">
            Asunto: <b className="text-white/75">{preview.subject || '—'}</b>
          </p>
          <iframe title="Vista previa del email" srcDoc={preview.html} sandbox="" className="w-full h-[560px] rounded-2xl border border-white/10 bg-white" />
        </section>
      </div>

      {showTemplates && (
        <TemplatePicker
          token={token}
          current={{ subject, body }}
          onClose={() => setShowTemplates(false)}
          onPick={(t) => {
            setSubject(t.subject);
            setBody(t.body);
            setDirty(true);
            setShowTemplates(false);
          }}
        />
      )}

      {confirmSend && (
        <Modal title="¿Enviar la campaña?" onClose={() => setConfirmSend(false)}>
          <p className="text-sm text-white/70 leading-relaxed">
            Se enviará <b>«{subject}»</b> a <b>{recipients.length}</b> {recipients.length === 1 ? 'contacto' : 'contactos'}
            {audienceTags.length > 0 ? ` con las etiquetas ${audienceTags.join(', ')}` : ''}{repeatsAvoided > 0 ? `, sin los ${repeatsAvoided} que ya recibieron una campaña anterior` : ''}. No se puede deshacer.
          </p>
          <p className="text-xs text-white/45 mt-3">Consejo: envíate antes una prueba para revisar cómo se ve. Los proveedores de correo limitan los envíos diarios (p. ej. unos 500 al día con Gmail).</p>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setConfirmSend(false)} className="px-5 h-10 rounded-full border border-white/15 text-sm cursor-pointer">Cancelar</button>
            <button onClick={runSend} className="px-6 h-10 rounded-full portal-cta text-sm cursor-pointer inline-flex items-center gap-2"><Send className="w-4 h-4" /> Enviar ahora</button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="¿Eliminar la campaña?" onClose={() => setConfirmDelete(false)}>
          <p className="text-sm text-white/70">Se borra «{campaign.name}» y su registro de envíos. Los contactos no se tocan.</p>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setConfirmDelete(false)} className="px-5 h-10 rounded-full border border-white/15 text-sm cursor-pointer">Cancelar</button>
            <button onClick={remove} className="px-6 h-10 rounded-full bg-red-500/90 text-white text-sm font-semibold cursor-pointer">Eliminar</button>
          </div>
        </Modal>
      )}
    </Page>
  );
}
