import type { CampaignStatus } from '@/lib/campaigns';
import type { DeliveryState } from '@/lib/campaignTemplates';

/** Estilo de la etiqueta de estado de una campaña en el panel. */
export const CAMPAIGN_BADGE: Record<CampaignStatus, string> = {
  draft: 'bg-gray-800/30 text-gray-400 border border-gray-700',
  sending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25',
  sent: 'bg-[var(--signal)]/15 text-[var(--signal)] border border-[var(--signal)]/30',
};

/** Estilo de la etiqueta de estado de entrega de cada destinatario. */
export const DELIVERY_BADGE: Record<DeliveryState, string> = {
  queued: 'bg-gray-800/30 text-gray-400 border border-gray-700',
  sent: 'bg-white/[0.06] text-white/70 border border-white/15',
  delivered: 'bg-sky-500/10 text-sky-400 border border-sky-500/25',
  opened: 'bg-[var(--signal)]/15 text-[var(--signal)] border border-[var(--signal)]/30',
  clicked: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  bounced: 'bg-red-500/10 text-red-400 border border-red-500/25',
  complained: 'bg-red-500/10 text-red-400 border border-red-500/25',
  failed: 'bg-red-500/10 text-red-400 border border-red-500/25',
  skipped: 'bg-gray-800/30 text-gray-400 border border-gray-700',
};
