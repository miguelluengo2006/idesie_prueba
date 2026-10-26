'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { crm } from '@/components/portal/crmApi';
import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  GraduationCap,
  Inbox,
  Megaphone,
  MessageCircle,
  Phone,
  PhoneCall,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCallDate, formatCallTime, callDayKey, todayInBookingTz, addDays } from '@/lib/booking';
import { useLeadsContext, newRequests, upcomingCalls, isPendingCall } from '@/app/portal/leads/context';
import type { Lead } from '@/app/portal/leads/context';
import { statusMeta, timeAgo, whatsappUrl } from '@/components/portal/leadMeta';
import { CountUp, EmptyState, Page, Panel, Skeleton, Sparkline, untilLabel } from '@/components/portal/ui';
import ActivityChart from './ActivityChart';

const SPARK_DAYS = 14;

const greeting = () => {
  const hour = Number(new Intl.DateTimeFormat('es-ES', { hour: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Madrid' }).format(new Date()));
  return hour < 13 ? 'Buenos días' : hour < 21 ? 'Buenas tardes' : 'Buenas noches';
};

function Kpi({ label, value, hint, icon, href, spark, highlight, delay }: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ReactNode;
  href: string;
  spark?: number[];
  highlight?: boolean;
  delay: number;
}) {
  return (
    <Link
      href={href}
      className="card-liquid card-liquid-interactive rounded-3xl p-4 md:p-5 flex flex-col gap-2 group pn-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="pn-title">{label}</span>
        <span className={cn('transition-colors', highlight ? 'text-[var(--signal)]' : 'text-white/30 group-hover:text-[var(--signal)]')}>{icon}</span>
      </div>
      <div className="text-3xl md:text-4xl font-semibold tracking-tight tabular-nums leading-none">{value}</div>
      {spark ? <Sparkline data={spark} className="mt-1" /> : <div className="h-9" />}
      {hint && <div className="text-xs text-white/45 -mt-1">{hint}</div>}
    </Link>
  );
}

type FeedEvent = { id: string; at: string; icon: React.ReactNode; title: string; sub: string; href: string; tone?: 'green' | 'blue' };

function feedOf(leads: Lead[]): FeedEvent[] {
  const events: FeedEvent[] = [];
  for (const l of leads) {
    if (l.status === 'enrolled' || l.status === 'paid') {
      events.push({
        id: `${l.id}-won`,
        at: l.created_at,
        icon: <GraduationCap className="w-4 h-4" />,
        title: `${l.name} ${l.status === 'paid' ? 'ha pagado la matrícula' : 'se ha matriculado'}`,
        sub: l.answers?.needs?.join(', ') || l.company || 'Matrícula',
        href: `/portal/leads?open=${l.id}`,
        tone: 'green',
      });
    } else if (l.kind === 'call' && l.call_at) {
      events.push({
        id: `${l.id}-call`,
        at: l.created_at,
        icon: <PhoneCall className="w-4 h-4" />,
        title: `${l.name} agendó una llamada`,
        sub: `${formatCallDate(l.call_at)} · ${formatCallTime(l.call_at)}`,
        href: `/portal/calls?open=${l.id}`,
        tone: 'blue',
      });
    } else {
      events.push({
        id: `${l.id}-req`,
        at: l.created_at,
        icon: <Inbox className="w-4 h-4" />,
        title: `Nuevo lead: ${l.name}`,
        sub: l.answers?.needs?.join(', ') || l.message?.slice(0, 70) || 'Lead',
        href: `/portal/leads?open=${l.id}`,
      });
    }
  }
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
}

interface CrmSummary {
  total: number;
  subscribed: number;
  unsubscribed: number;
  noConsent: number;
  lastCampaign: { id: string; name: string; status: string; total: number; sent_count: number; failed_count: number } | null;
}

export default function AdminDashboard() {
  const { leads, loading } = useLeadsContext();
  const { user, session } = useAuth();
  const [crmSummary, setCrmSummary] = useState<CrmSummary | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // Números de contactos y última campaña (si la migración del CRM aún no está aplicada, simplemente no se muestran)
  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;
    crm<CrmSummary>(token, '/api/contacts?summary=1').then(setCrmSummary).catch(() => setCrmSummary(null));
  }, [session?.access_token]);

  const stats = useMemo(() => {
    const upcoming = upcomingCalls(leads, now);
    const today = todayInBookingTz();
    const weekEnd = addDays(today, 7);
    const inWeek = upcoming.filter((l) => callDayKey(l.call_at!) <= weekEnd);
    const todayCalls = upcoming.filter((l) => callDayKey(l.call_at!) === today);
    const won = leads.filter((l) => l.status === 'enrolled' || l.status === 'paid').length;
    const closed = won + leads.filter((l) => l.status === 'lost').length;

    // Serie diaria (últimos 14 días) para la gráfica pequeña
    const keys = Array.from({ length: SPARK_DAYS }, (_, i) => addDays(today, i - (SPARK_DAYS - 1)));
    const reqByDay = new Map(keys.map((k) => [k, 0]));
    for (const l of leads) {
      const k = callDayKey(l.created_at);
      if (reqByDay.has(k)) reqByDay.set(k, (reqByDay.get(k) || 0) + 1);
    }

    const unmarked = leads.filter((l) => isPendingCall(l) && new Date(l.call_at!).getTime() + 30 * 60000 < now).length;
    const funnel = {
      leads: leads.filter((l) => l.kind !== 'call' || l.call_at).length,
      followed: leads.filter((l) => l.status !== 'new' && l.status !== 'lost').length,
      won,
      paid: leads.filter((l) => l.status === 'paid').length,
    };

    return {
      upcoming,
      next: upcoming[0] || null,
      inWeek: inWeek.length,
      todayCalls: todayCalls.length,
      newList: newRequests(leads),
      conversion: closed > 0 ? Math.round((won / closed) * 100) : null,
      won,
      unmarked,
      funnel,
      reqSpark: keys.map((k) => reqByDay.get(k) || 0),
      feed: feedOf(leads),
    };
  }, [leads, now]);

  const todayLabel = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' }).format(new Date());
  const firstName = (user?.email || '').split('@')[0].split(/[._-]/)[0];

  if (loading) {
    return (
      <Page title="Resumen" subtitle={todayLabel}>
        <Skeleton className="h-52" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36" />)}
        </div>
        <Skeleton className="h-64" />
      </Page>
    );
  }

  const next = stats.next;
  const nextWa = whatsappUrl(next?.phone);
  const todos: { n: number; label: string; href: string; icon: React.ReactNode }[] = [
    { n: stats.newList.length, label: stats.newList.length === 1 ? 'lead por responder' : 'leads por responder', href: '/portal/leads', icon: <Inbox className="w-4 h-4" /> },
    { n: stats.unmarked, label: stats.unmarked === 1 ? 'llamada sin marcar' : 'llamadas sin marcar', href: '/portal/calls', icon: <PhoneCall className="w-4 h-4" /> },
  ].filter((t) => t.n > 0);

  return (
    <Page title="Resumen" subtitle={`${greeting()}${firstName ? `, ${firstName}` : ''} · ${todayLabel}`}>
      {/* Ahora: lo siguiente que pasa + lo que hay que hacer */}
      <section className="pn-hero p-5 md:p-7 pn-in">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] items-center">
          <div className="min-w-0">
            {next ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 bg-[var(--signal)] text-black', untilLabel(next.call_at!, now) === 'Ahora' && 'pn-live')}>
                    <PhoneCall className="w-3.5 h-3.5" /> Próxima llamada · {untilLabel(next.call_at!, now)}
                  </span>
                  <span className="text-xs text-white/50 hidden sm:inline">{formatCallDate(next.call_at!)} · {formatCallTime(next.call_at!)}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight truncate">{next.name}</h2>
                <p className="text-sm text-white/55 mt-1 truncate">{[next.company, next.phone || next.email].filter(Boolean).join(' · ')}</p>
                {next.answers?.needs?.length ? (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {next.answers.needs.map((n) => <span key={n} className="pn-chip">{n}</span>)}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2 mt-5">
                  {next.phone && (
                    <a href={`tel:${next.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full portal-cta text-sm">
                      <Phone className="w-4 h-4" /> Llamar
                    </a>
                  )}
                  {nextWa && (
                    <a href={nextWa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/15 text-sm hover:border-[var(--portal-line-strong)]">
                      <MessageCircle className="w-4 h-4 text-green-400" /> WhatsApp
                    </a>
                  )}
                  <Link href={`/portal/calls?open=${next.id}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/15 text-sm hover:border-[var(--portal-line-strong)]">
                    <UserRound className="w-4 h-4" /> Ver ficha
                  </Link>
                </div>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 border border-[var(--portal-line-strong)] text-[var(--signal)] mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Sin llamadas pendientes
                </span>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Agenda libre</h2>
                <p className="text-sm text-white/55 mt-1 max-w-md">Cuando alguien reserve una llamada desde tu web, la verás aquí con cuenta atrás y botones para llamarle al momento.</p>
              </>
            )}
          </div>

          <div className="min-w-0">
            <div className="pn-title mb-3">Para hacer ahora</div>
            {todos.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--portal-line)] bg-white/[0.03] p-4 text-sm text-white/65">
                <CheckCircle2 className="w-5 h-5 text-[var(--signal)] shrink-0" /> Todo al día. No hay nada pendiente.
              </div>
            ) : (
              <ul className="space-y-2">
                {todos.map((t) => (
                  <li key={t.label}>
                    <Link href={t.href} className="flex items-center gap-3 rounded-2xl border border-[var(--portal-line)] bg-white/[0.04] hover:border-[var(--portal-line-strong)] px-4 py-3 transition-colors group">
                      <span className="w-8 h-8 rounded-xl bg-[var(--signal)]/12 text-[var(--signal)] flex items-center justify-center shrink-0">{t.icon}</span>
                      <span className="flex-1 text-sm"><b className="tabular-nums text-base mr-1.5">{t.n}</b>{t.label}</span>
                      <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-[var(--signal)] transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Kpi
          label="Leads nuevos"
          value={<CountUp value={stats.newList.length} />}
          hint="Pendientes de respuesta"
          icon={<Inbox className="w-4 h-4" />}
          href="/portal/leads"
          spark={stats.reqSpark}
          highlight={stats.newList.length > 0}
          delay={60}
        />
        <Kpi
          label="Llamadas próximas"
          value={<CountUp value={stats.inWeek} />}
          hint={stats.todayCalls > 0 ? `${stats.todayCalls} hoy` : 'Próximos 7 días'}
          icon={<PhoneCall className="w-4 h-4" />}
          href="/portal/calls"
          highlight={stats.todayCalls > 0}
          delay={120}
        />
        <Kpi
          label="Contactos suscritos"
          value={crmSummary ? <CountUp value={crmSummary.subscribed} /> : '—'}
          hint={crmSummary ? `de ${crmSummary.total} en tu agenda` : 'Agenda de contactos'}
          icon={<Users className="w-4 h-4" />}
          href="/portal/contacts"
          delay={180}
        />
        <Kpi
          label="Matriculados"
          value={<CountUp value={stats.won} />}
          hint={stats.conversion === null ? 'Aún sin cierres' : `${stats.conversion}% de los leads cerrados`}
          icon={<GraduationCap className="w-4 h-4" />}
          href="/portal/leads"
          highlight={stats.won > 0}
          delay={240}
        />
      </div>

      {leads.length === 0 && (
        <Panel title="Primeros pasos">
          <ul className="grid gap-3 md:grid-cols-3">
            {[
              { done: false, title: 'Comparte tu web', text: 'Cada llamada agendada y cada formulario aparecerá aquí al instante como un lead.', href: '/', label: 'Abrir la web', external: true },
              { done: false, title: 'Configura el email', text: 'Lo necesitas para recibir avisos de cada lead y para enviar campañas.', href: '/portal/settings?tab=connections', label: 'Abrir ajustes' },
              { done: (crmSummary?.total || 0) > 0, title: 'Importa tus contactos', text: 'Sube un CSV con tus alumnos y empresas para empezar a hacer campañas.', href: '/portal/contacts', label: 'Ir a contactos' },
            ].map((step) => (
              <li key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {step.done ? <CheckCircle2 className="w-4 h-4 text-[var(--signal)]" /> : <Circle className="w-4 h-4 text-white/30" />}
                  {step.title}
                </div>
                <p className="text-xs text-white/50 flex-1">{step.text}</p>
                <Link href={step.href} target={step.external ? '_blank' : undefined} className="text-xs text-[var(--signal)] hover:underline inline-flex items-center gap-1 w-fit">
                  {step.label} <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
        {/* Agenda */}
        <Panel title="Agenda" action={{ label: 'Ver todas', href: '/portal/calls' }} className="xl:col-span-2" delay={120}>
          {stats.upcoming.length === 0 ? (
            <EmptyState icon={<PhoneCall className="w-6 h-6" />} title="Sin llamadas agendadas" text="Cuando alguien reserve desde la web, aparecerá aquí." />
          ) : (
            <ul className="space-y-1 -mx-2">
              {stats.upcoming.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <Link href={`/portal/calls?open=${l.id}`} className="pn-row flex items-center gap-3 md:gap-4 rounded-2xl px-2 py-2.5 group">
                    <div className="w-14 shrink-0 text-center rounded-2xl border border-[var(--portal-line)] bg-white/[0.03] py-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-white/45 font-mono">
                        {new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: 'Europe/Madrid' }).format(new Date(l.call_at!)).replace('.', '')}
                      </div>
                      <div className="font-kinetic text-lg leading-tight">
                        {new Intl.DateTimeFormat('es-ES', { day: 'numeric', timeZone: 'Europe/Madrid' }).format(new Date(l.call_at!))}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate group-hover:text-[var(--signal)] transition-colors">
                        {l.name}{l.company ? <span className="text-white/45 font-normal"> · {l.company}</span> : null}
                      </div>
                      <div className="text-xs text-white/45 truncate">
                        {l.answers?.needs?.length ? l.answers.needs.join(', ') : l.phone || l.email}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-kinetic text-[var(--signal)] text-sm">{formatCallTime(l.call_at!)}</div>
                      <div className="text-[11px] text-white/40">{untilLabel(l.call_at!, now)}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Actividad (gráfica) */}
        <Panel title="Leads · 14 días" delay={180}>
          <ActivityChart leads={leads} />
        </Panel>

        {/* Actividad reciente */}
        <Panel title="Actividad reciente" action={{ label: 'Ver leads', href: '/portal/leads' }} className="xl:col-span-2" delay={240}>
          {stats.feed.length === 0 ? (
            <EmptyState icon={<Inbox className="w-6 h-6" />} title="Todavía no hay actividad" text="Leads, llamadas y matrículas aparecerán aquí en tiempo real." />
          ) : (
            <ul className="relative space-y-1 -mx-2">
              {stats.feed.map((e) => (
                <li key={e.id}>
                  <Link href={e.href} className="pn-row flex items-center gap-3 rounded-2xl px-2 py-2.5 group">
                    <span
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border',
                        e.tone === 'green' ? 'bg-green-400/10 text-green-400 border-green-400/25' : e.tone === 'blue' ? 'bg-blue-400/10 text-blue-400 border-blue-400/25' : 'bg-white/[0.05] text-white/70 border-white/10'
                      )}
                    >
                      {e.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate group-hover:text-[var(--signal)] transition-colors">{e.title}</span>
                      <span className="block text-xs text-white/45 truncate">{e.sub}</span>
                    </span>
                    <span className="text-[11px] text-white/35 shrink-0 hidden sm:block">{timeAgo(e.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Embudo */}
        <Panel title="Embudo" delay={300}>
          <ul className="space-y-4">
            {[
              { label: 'Leads y llamadas', v: stats.funnel.leads, status: 'new' as const },
              { label: 'En admisión', v: stats.funnel.followed, status: 'admission' as const },
              { label: 'Matriculados', v: stats.funnel.won, status: 'enrolled' as const },
              { label: 'Pagados', v: stats.funnel.paid, status: 'paid' as const },
            ].map((row) => {
              const pct = stats.funnel.leads ? Math.round((row.v / stats.funnel.leads) * 100) : 0;
              return (
                <li key={row.label}>
                  <div className="flex items-baseline justify-between text-sm mb-1.5">
                    <span className="text-white/70 flex items-center gap-2">
                      <span className={cn('w-1.5 h-1.5 rounded-full', statusMeta(row.status).dotColor)} />
                      {row.label}
                    </span>
                    <span className="tabular-nums"><b>{row.v}</b><span className="text-white/35 text-xs ml-1.5">{pct}%</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[var(--signal-dim)] to-[var(--signal)] shadow-[0_0_12px_var(--portal-glow)] transition-[width] duration-700" style={{ width: `${Math.max(pct, row.v ? 3 : 0)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Campañas */}
        <Panel title="Campañas" action={{ label: 'Ver campañas', href: '/portal/campaigns' }} delay={360}>
          {crmSummary?.lastCampaign ? (
            <Link href={`/portal/campaigns/${crmSummary.lastCampaign.id}`} className="block rounded-2xl border border-[var(--portal-line)] bg-white/[0.04] hover:border-[var(--portal-line-strong)] p-4 transition-colors">
              <div className="text-xs text-white/45 mb-1">Última campaña</div>
              <div className="text-sm font-semibold truncate">{crmSummary.lastCampaign.name}</div>
              <div className="text-xs text-white/55 mt-1 tabular-nums">
                {crmSummary.lastCampaign.status === 'draft'
                  ? 'Borrador sin enviar'
                  : `${crmSummary.lastCampaign.sent_count} de ${crmSummary.lastCampaign.total} enviados${crmSummary.lastCampaign.failed_count ? ` · ${crmSummary.lastCampaign.failed_count} fallidos` : ''}`}
              </div>
            </Link>
          ) : (
            <EmptyState icon={<Megaphone className="w-6 h-6" />} title="Aún no hay campañas" text="Escribe un email y envíalo a tus contactos suscritos." />
          )}
          {crmSummary && crmSummary.noConsent > 0 && (
            <p className="text-xs text-white/45 mt-3">
              {crmSummary.noConsent} {crmSummary.noConsent === 1 ? 'contacto no ha dado' : 'contactos no han dado'} su consentimiento y no recibirán campañas.
            </p>
          )}
        </Panel>
      </div>
    </Page>
  );
}
