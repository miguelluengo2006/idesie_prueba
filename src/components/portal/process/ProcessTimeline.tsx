'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BellRing, CalendarClock, ClipboardList, MessageSquareText, CreditCard, PhoneCall, Plus, UserCheck, UserX, type LucideIcon } from 'lucide-react';
import type { Lead } from '@/app/portal/leads/context';
import { PIPELINE, passRate, reachCounts, sinceLabel, type Cohort, type LeadStatus, type Stage } from '@/lib/admissions';
import { leadChannel, leadInterest, leadWaContext, statusMeta } from '@/components/portal/leadMeta';
import WhatsAppMenu from '@/components/portal/WhatsAppMenu';
import { CountUp } from '@/components/portal/ui';
import { cn } from '@/lib/utils';

const STAGE_ICON: Record<Stage, LucideIcon> = {
  new: BellRing,
  contacted: MessageSquareText,
  admission: ClipboardList,
  call: PhoneCall,
  followup: CalendarClock,
  enrolled: UserCheck,
  paid: CreditCard,
};

const EASE = [0.22, 1, 0.36, 1] as const;

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?';

/**
 * El recorrido de una persona, de la primera toma de contacto hasta el pago, como una línea con una parada por etapa.
 * Cada tramo enseña qué porcentaje pasa a la siguiente y se rellena al cargar. Las personas se arrastran de una
 * parada a otra (o se mueven con las flechas de cada tarjeta, que sirven en móvil y con teclado).
 */
export default function ProcessTimeline({
  leads,
  onMove,
  onOpen,
  onAdd,
  flashId,
  cohorts,
}: {
  /** Leads ya con la etapa efectiva (incluye los cambios aún sin confirmar) */
  leads: Lead[];
  onMove: (lead: Lead, to: LeadStatus) => void;
  onOpen: (lead: Lead) => void;
  /** Abre «Añadir contacto» con esa etapa elegida */
  onAdd: (stage: Stage) => void;
  /** Lead que acaba de moverse: se resalta un momento */
  flashId: string | null;
  /** Para que los mensajes de WhatsApp mencionen la convocatoria */
  cohorts?: Cohort[];
}) {
  const reduce = useReducedMotion();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStatus | null>(null);

  const reach = useMemo(() => reachCounts(leads), [leads]);
  const byStage = useMemo(() => {
    const map = new Map<Stage, Lead[]>(PIPELINE.map((p) => [p.status, []]));
    for (const l of leads) map.get(l.status as Stage)?.push(l);
    // Lo que lleva más tiempo parado, arriba: es lo que hay que mover
    for (const rows of map.values()) rows.sort((a, b) => Date.parse(a.updated_at || a.created_at) - Date.parse(b.updated_at || b.created_at));
    return map;
  }, [leads]);

  const drop = (to: LeadStatus) => {
    const lead = leads.find((l) => l.id === dragId);
    setDragId(null);
    setOverStage(null);
    if (lead && lead.status !== to) onMove(lead, to);
  };

  const dropProps = (to: LeadStatus) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!dragId) return;
      e.preventDefault();
      setOverStage(to);
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverStage((cur) => (cur === to ? null : cur));
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      drop(to);
    },
  });

  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 38 };

  return (
    <LayoutGroup>
      <div className="relative">
        {/* Línea del recorrido (solo en escritorio): un tramo por cada paso, con su porcentaje */}
        <div className="hidden lg:block absolute inset-x-0 top-[22px] h-0 pointer-events-none" aria-hidden="true">
          {PIPELINE.slice(0, -1).map((p, i) => {
            const rate = passRate(reach[p.status], reach[PIPELINE[i + 1].status]);
            return (
              <div key={p.status} className="absolute top-0 -translate-y-1/2" style={{ left: `${(i + 0.5) * (100 / PIPELINE.length)}%`, width: `${100 / PIPELINE.length}%` }}>
                <div className="h-[3px] rounded-full bg-[var(--portal-line-strong)] mx-[26px] overflow-hidden">
                  <motion.div
                    className="h-full origin-left rounded-full bg-[var(--signal)]"
                    initial={{ scaleX: reduce ? (rate ?? 0) / 100 : 0 }}
                    animate={{ scaleX: (rate ?? 0) / 100 }}
                    transition={{ duration: reduce ? 0 : 0.9, ease: EASE, delay: reduce ? 0 : 0.15 + i * 0.12 }}
                  />
                </div>
                {rate !== null && (
                  <span className="absolute left-1/2 -translate-x-1/2 -top-[22px] text-xs font-semibold tabular-nums text-[var(--signal)] bg-[#ffffff] border border-[var(--portal-line-strong)] rounded-full px-2 py-px">
                    {rate}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <ol className="grid gap-x-3 gap-y-8 lg:grid-cols-7">
          {PIPELINE.map((p, i) => {
            const rows = byStage.get(p.status) || [];
            const Icon = STAGE_ICON[p.status];
            const meta = statusMeta(p.status);
            const isOver = overStage === p.status;
            const prev = i > 0 ? PIPELINE[i - 1].status : null;
            const next = i < PIPELINE.length - 1 ? PIPELINE[i + 1].status : null;
            return (
              <li key={p.status} className="relative min-w-0 pl-14 lg:pl-0" aria-label={`${p.label}: ${rows.length}`}>
                {/* Raíl vertical en móvil */}
                {i < PIPELINE.length - 1 && <span className="lg:hidden absolute left-[21px] top-11 -bottom-8 w-[3px] rounded-full bg-[var(--portal-line-strong)]" aria-hidden="true" />}

                <div className="flex lg:flex-col lg:items-center gap-3 lg:gap-2 -ml-14 pl-0 lg:ml-0 relative z-10">
                  <motion.span
                    initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : i * 0.08 }}
                    className={cn(
                      'relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 bg-[#ffffff] transition-colors',
                      rows.length > 0 ? 'border-[var(--signal)] text-[var(--signal)]' : 'border-[var(--portal-line-strong)] text-white/35'
                    )}
                  >
                    <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                    <span className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#ffffff]', rows.length > 0 ? meta.dotColor : 'bg-[var(--portal-line-strong)]')} aria-hidden="true" />
                  </motion.span>
                  <div className="min-w-0 flex-1 lg:flex-none lg:text-center">
                    <h2 className="text-sm font-semibold leading-tight">{p.label}</h2>
                    <p className="text-xs text-white/50 truncate">{p.hint}</p>
                  </div>
                  <div className="flex items-center gap-2 lg:mt-0.5">
                    <span className="text-2xl font-semibold tabular-nums leading-none">
                      <CountUp value={rows.length} />
                    </span>
                    <button
                      type="button"
                      onClick={() => onAdd(p.status)}
                      aria-label={`Añadir un contacto a ${p.label}`}
                      title={`Añadir a ${p.label}`}
                      className="w-8 h-8 rounded-full border border-[var(--portal-line-strong)] hover:border-[var(--signal)] hover:text-[var(--signal)] text-white/55 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Personas de la parada */}
                <div
                  {...dropProps(p.status)}
                  className={cn(
                    'mt-4 rounded-2xl min-h-28 p-1.5 -m-1.5 transition-colors',
                    isOver ? 'bg-[var(--signal)]/10 outline outline-2 outline-dashed outline-[var(--signal)]' : dragId ? 'bg-black/[0.025]' : ''
                  )}
                >
                  <ul className="flex flex-col gap-2">
                    <AnimatePresence initial={false}>
                      {rows.map((lead) => (
                        <PersonCard
                          key={lead.id}
                          lead={lead}
                          prev={prev}
                          next={next}
                          dragging={dragId === lead.id}
                          flash={flashId === lead.id}
                          cohorts={cohorts}
                          spring={spring}
                          onOpen={() => onOpen(lead)}
                          onMove={(to) => onMove(lead, to)}
                          onDragStart={() => setDragId(lead.id)}
                          onDragEnd={() => {
                            setDragId(null);
                            setOverStage(null);
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                  {rows.length === 0 && (
                    <button
                      type="button"
                      onClick={() => onAdd(p.status)}
                      className="w-full min-h-24 rounded-2xl border border-dashed border-[var(--portal-line-strong)] hover:border-[var(--signal)] text-xs text-white/40 hover:text-[var(--signal)] cursor-pointer transition-colors"
                    >
                      {dragId ? 'Suelta aquí' : 'Nadie todavía · añadir'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {/* Mientras se arrastra: soltar aquí para descartar */}
        <AnimatePresence>
          {dragId && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: reduce ? 0 : 0.2, ease: EASE }}
              {...dropProps('lost')}
              className={cn(
                'mt-6 flex items-center justify-center gap-2 rounded-2xl border border-dashed py-4 text-sm font-medium transition-colors',
                overStage === 'lost' ? 'border-red-400 bg-red-500/10 text-red-400' : 'border-[var(--portal-line-strong)] text-white/50'
              )}
            >
              <UserX className="w-4 h-4" aria-hidden="true" /> Suelta aquí para descartar
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

function PersonCard({
  lead,
  prev,
  next,
  dragging,
  flash,
  cohorts,
  spring,
  onOpen,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  prev: LeadStatus | null;
  next: LeadStatus | null;
  dragging: boolean;
  flash: boolean;
  cohorts?: Cohort[];
  spring: object;
  onOpen: () => void;
  onMove: (to: LeadStatus) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const interest = leadInterest(lead);
  const channel = leadChannel(lead);
  const since = sinceLabel(lead.updated_at || lead.created_at);
  const sub = lead.phone || lead.email || lead.company || '';
  const iconBtn = 'w-7 h-7 rounded-full flex items-center justify-center text-white/55 hover:text-[var(--signal)] hover:bg-[var(--signal)]/10 cursor-pointer transition-colors';

  return (
    <motion.li layout layoutId={lead.id} transition={spring} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: dragging ? 0.4 : 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="list-none">
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', lead.id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        className={cn(
          'group rounded-2xl p-3 bg-[#ffffff] border border-[rgba(13,21,34,0.1)] cursor-grab active:cursor-grabbing transition-[box-shadow,border-color] hover:border-[var(--signal)]',
          flash && '!border-[var(--signal)] shadow-[0_0_0_3px_rgba(0,99,230,0.18)]'
        )}
      >
        <button type="button" onClick={onOpen} className="w-full flex items-start gap-2.5 text-left cursor-pointer">
          <span className="w-8 h-8 rounded-full bg-[var(--signal)]/12 text-[var(--signal)] text-xs font-semibold flex items-center justify-center shrink-0" aria-hidden="true">
            {initials(lead.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold truncate">{lead.name}</span>
            {sub && <span className="block text-xs text-white/50 truncate">{sub}</span>}
          </span>
        </button>

        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-white/45">
          <span className="truncate">{[channel.label, interest].filter(Boolean).join(' · ')}</span>
          {since && <span className="shrink-0">{since}</span>}
        </div>

        <div className="mt-2 pt-2 border-t border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {prev && (
              <button type="button" onClick={() => onMove(prev)} aria-label={`Mover a ${statusMeta(prev).label}`} title={`Mover a ${statusMeta(prev).label}`} className={iconBtn}>
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
            <WhatsAppMenu phone={lead.phone} name={lead.name} status={lead.status} context={leadWaContext(lead, cohorts)} className="!w-7 !h-7" />
          </div>
          {next && (
            <button
              type="button"
              onClick={() => onMove(next)}
              className="inline-flex items-center gap-1 h-7 pl-2.5 pr-2 rounded-full text-xs font-semibold text-[var(--signal)] hover:bg-[var(--signal)]/10 cursor-pointer transition-colors"
            >
              {statusMeta(next).label} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </motion.li>
  );
}
