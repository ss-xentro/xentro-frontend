/**
 * Re-export the unified DashboardSidebar pre-configured for institution role.
 * All existing imports from '@/components/institution/DashboardSidebar' continue to work.
 */
import { ReactNode } from 'react';
import AppShell from '@/components/ui/AppShell';

interface DashboardSidebarProps {
	children: ReactNode;
}

export function DashboardSidebar({ children }: DashboardSidebarProps) {
	return <AppShell>{children}</AppShell>;
}
