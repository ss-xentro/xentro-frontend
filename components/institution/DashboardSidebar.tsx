'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';

interface DashboardSidebarProps {
  children: ReactNode;
}

export function DashboardSidebar({ children }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { 
      name: 'Overview', 
      href: '/institution-dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Edit Profile', 
      href: '/institution-edit', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    { 
      name: 'Startups', 
      href: '/institution-dashboard/startups', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      name: 'Projects', 
      href: '/institution-dashboard/projects', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      name: 'Team Members', 
      href: '/institution-dashboard/team', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      name: 'Analytics', 
      href: '/institution-dashboard/analytics', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('institution_token');
    window.location.href = '/institution-login';
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 shrink-0 transition-all duration-300 flex flex-col h-screen`}>
        {/* Logo & Collapse Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <img src="/xentro-logo.png" alt="XENTRO" className="h-7 w-auto" />
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
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
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg transition-colors ${
                  isActive
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {!isCollapsed && <span className="font-medium text-sm">Support</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-screen">
        {children}
      </main>
    </div>
  );
}
