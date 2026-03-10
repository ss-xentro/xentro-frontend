'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { getRoleFromSession, getSessionToken, clearAllRoleTokens, clearAuthCookie, clearTokenCookie } from '@/lib/auth-utils';
import { useAuth } from '@/contexts/AuthContext';
import { icons } from './sidebar-icons';
import { type UserRole, type NavItem, getNavItems, roleLabels, logoutRedirects } from './sidebar-nav-config';

export type { UserRole };

interface DashboardSidebarProps {
  children: ReactNode;
  userType?: UserRole;
}

export function DashboardSidebar({ children, userType }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const resolvedRole: UserRole = userType ?? (getRoleFromSession() as UserRole) ?? 'startup';
  const navigation = getNavItems(resolvedRole);

  const handleLogout = async () => {
    if (resolvedRole === 'institution') {
      try {
        const token = getSessionToken('institution');
        if (token) {
          await fetch('/api/auth/logout/', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
          });
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        clearAllRoleTokens();
        clearAuthCookie();
        clearTokenCookie();
        window.location.href = logoutRedirects[resolvedRole];
      }
      return;
    }
    logout();
    router.push(logoutRedirects[resolvedRole]);
  };

  const isActive = (href: string) => pathname === href;

  const sidebarContent = (
    <>
      {/* Logo & Collapse Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <img src="/xentro-logo.png" alt="XENTRO" className="h-7 w-auto" />
            <span className="ml-1 text-xs font-medium text-gray-500 border border-gray-300 px-1.5 py-0.5 rounded">
              {roleLabels[resolvedRole]}
            </span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto hidden lg:inline-flex"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg transition-colors ${active
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              {item.icon}
              {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-200 space-y-1 shrink-0">
        <Link
          href="mailto:support@xentro.io"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors`}
          title={isCollapsed ? 'Support' : undefined}
        >
          {icons.support}
          {!isCollapsed && <span className="font-medium text-sm">Support</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          {icons.logout}
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 shrink-0 transition-all duration-300 flex-col h-screen hidden lg:flex`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <img src="/xentro-logo.png" alt="XENTRO" className="h-6 w-auto" />
          <span className="text-xs font-medium text-gray-500 border border-gray-300 px-1.5 py-0.5 rounded">
            {roleLabels[resolvedRole]}
          </span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 -mr-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-screen pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
