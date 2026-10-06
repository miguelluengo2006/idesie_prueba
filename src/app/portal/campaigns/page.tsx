'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Megaphone, Plus, Users } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { cn } from '@/lib/utils';
import { EmptyState, Page, Skeleton } from '@/components/portal/ui';
import { crm } from '@/components/portal/crmApi';
import { timeAgo } from '@/components/portal/leadMeta';
import { CAMPAIGN_BADGE } from '@/components/portal/campaignMeta';
import { CAMPAIGN_STATUS_LABEL, type Campaign } from '@/lib/campaigns';

export default function CampaignsPage() {
  const { session } = useAuth();
  const token = session?.access_token;
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setCampaigns((await crm<{ campaigns: Campaign[] }>(token, '/api/campaigns')).campaigns);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setCreating(true);
    try {
      const { campaign } = await crm<{ campaign: Campaign }>(token, '/api/campaigns', { method: 'POST', body: {} });
      router.push(`/portal/campaigns/${campaign.id}`);
    } catch (err: any) {
      setError(err.message);
      setCreating(false);
    }
  };

  const newButton = (
    <button onClick={create} disabled={creating} className="flex items-center gap-1.5 px-4 h-9 rounded-full portal-cta text-xs font-semibold cursor-pointer disabled:opacity-60">
      {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Nueva campaña
    </button>
  );

  if (loading) {
    return (
      <Page title="Campañas">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </Page>
    );
  }

  return (
    <Page title="Campañas" subtitle="Emails a tus contactos" actions={newButton}>
      {error && (
        <p role="alert" className="text-sm rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 px-4 py-3">
          {error} Si es la primera vez, ejecuta la migración migrations/add-crm.sql en Supabase (SQL Editor).
        </p>
      )}

      {campaigns.length === 0 && !error ? (
        <EmptyState
          icon={<Megaphone className="w-6 h-6" />}
          title="Aún no has creado ninguna campaña"
          text="Escribe un email, elige a quién va (todos tus suscritos o solo una etiqueta) y envíalo. Cada email lleva su enlace para darse de baja."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={create} disabled={creating} className="inline-flex items-center gap-2 px-5 h-10 rounded-full portal-cta text-sm cursor-pointer disabled:opacity-60">
                <Plus className="w-4 h-4" /> Crear mi primera campaña
              </button>
              <Link href="/portal/contacts" className="inline-flex items-center gap-2 px-5 h-10 rounded-full border border-white/15 hover:border-[var(--portal-line-strong)] text-sm">
                <Users className="w-4 h-4" /> Ver contactos
              </Link>
            </div>
          }
        />
      ) : (
        <ul className="space-y-3">
          {campaigns.map((c, i) => (
            <li key={c.id} className="pn-in" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
              <Link href={`/portal/campaigns/${c.id}`} className="card-liquid card-liquid-interactive rounded-3xl px-5 py-4 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold truncate">{c.name}</span>
                    <span className={cn('px-2 py-0.5 text-[11px] rounded-full shrink-0', CAMPAIGN_BADGE[c.status])}>{CAMPAIGN_STATUS_LABEL[c.status]}</span>
                  </div>
                  <p className="text-sm text-white/55 truncate mt-1">{c.subject || 'Sin asunto todavía'}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {c.audience_tags.length ? `Etiquetas: ${c.audience_tags.join(', ')}` : 'Todos los suscritos'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {c.status === 'draft' ? (
                    <div className="text-xs text-white/40">Editada {timeAgo(c.updated_at).toLowerCase()}</div>
                  ) : (
                    <>
                      <div className="text-sm tabular-nums"><b>{c.sent_count}</b><span className="text-white/45"> / {c.total} enviados</span></div>
                      {c.failed_count > 0 && <div className="text-xs text-red-400 tabular-nums">{c.failed_count} fallidos</div>}
                      <div className="text-[11px] text-white/40 mt-0.5">{timeAgo(c.sent_at || c.updated_at)}</div>
                    </>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
