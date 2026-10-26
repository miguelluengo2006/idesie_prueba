'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalRoleContext } from '@/app/portal/context';

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  const { role, loading: roleLoading } = usePortalRoleContext();
  const router = useRouter();

  // Los leads los carga una vez LeadsProvider para todo el panel (ver portal/layout.tsx)
  useEffect(() => {
    if (!roleLoading && role !== 'agency') router.replace('/portal');
  }, [role, roleLoading, router]);

  if (role !== 'agency') return null;

  return <div className="flex-1 min-w-0 overflow-hidden flex flex-col">{children}</div>;
}
