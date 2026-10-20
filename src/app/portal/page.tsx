'use client';

import { usePortalRoleContext } from './context';
import AdminDashboard from '@/components/portal/dashboard/AdminDashboard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

/**
 * /portal — el panel de la agencia (Resumen).
 */
export default function PortalHomePage() {
  const { role, loading } = usePortalRoleContext();

  if (loading || role !== 'agency') return null;

  return (
    <ErrorBoundary fallbackTitle="Error en el panel" fallbackMessage="Algo ha fallado al cargar el panel. Inténtalo de nuevo.">
      <AdminDashboard />
    </ErrorBoundary>
  );
}
