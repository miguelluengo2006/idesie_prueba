import type { CampaignStatus } from '@/lib/campaigns';

/** Estilo de la etiqueta de estado de una campaña en el panel. */
export const CAMPAIGN_BADGE: Record<CampaignStatus, string> = {
  draft: 'bg-gray-800/30 text-gray-400 border border-gray-700',
  sending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25',
  sent: 'bg-[var(--signal)]/15 text-[var(--signal)] border border-[var(--signal)]/30',
};
