'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface UserContext {
  context: string;
  entityId?: string;
  role?: string;
  name?: string;
}

interface ContextSwitcherProps {
  token?: string | null;
  currentContext?: string;
  contexts?: UserContext[];
  onContextSwitch?: (context: UserContext) => void;
}

const CONTEXT_META: Record<string, { label: string; icon: string; href: string }> = {
  explorer: { label: 'Explorer', icon: '🔍', href: '/feed' },
  startup: { label: 'Startup', icon: '🚀', href: '/dashboard' },
  mentor: { label: 'Mentor', icon: '🎯', href: '/mentor-dashboard' },
  institute: { label: 'Institution', icon: '🏛️', href: '/institution-dashboard' },
  admin: { label: 'Admin', icon: '⚙️', href: '/admin/dashboard' },
};

export function ContextSwitcher({ token, currentContext = 'explorer', contexts = [], onContextSwitch }: ContextSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = async (targetContext: UserContext) => {
    if (!token || switching) return;
    if (targetContext.context === currentContext && targetContext.entityId === contexts.find(c => c.context === currentContext)?.entityId) {
      setIsOpen(false);
      return;
    }

    setSwitching(true);
    try {
      const res = await fetch('/api/auth/context/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          context: targetContext.context,
          entityId: targetContext.entityId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to switch context');
      }

      const data = await res.json();
      
      // Store the new context token
      localStorage.setItem('xentro_context_token', data.token);
      localStorage.setItem('xentro_current_context', targetContext.context);
      if (targetContext.entityId) {
        localStorage.setItem('xentro_context_entity_id', targetContext.entityId);
      }

      onContextSwitch?.(targetContext);
      
      // Navigate to the context's dashboard
      const meta = CONTEXT_META[targetContext.context];
      if (meta) {
        window.location.href = meta.href;
      }
    } catch (err) {
      console.error('Failed to switch context:', err);
      alert(err instanceof Error ? err.message : 'Failed to switch context');
    } finally {
      setSwitching(false);
      setIsOpen(false);
    }
  };

  const currentMeta = CONTEXT_META[currentContext] || CONTEXT_META.explorer;

  // If only explorer context, don't show switcher
  if (contexts.length <= 1 && contexts[0]?.context === 'explorer') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--background)">
        <span>{currentMeta.icon}</span>
        <span className="text-sm font-medium">{currentMeta.label}</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
          'bg-(--background) hover:bg-(--border)',
          switching && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span>{currentMeta.icon}</span>
        <span className="text-sm font-medium">{currentMeta.label}</span>
        <svg
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-(--surface) border border-(--border) rounded-xl shadow-xl z-50 overflow-hidden animate-fadeInUp">
          <div className="px-4 py-2 border-b border-(--border)">
            <p className="text-xs text-(--secondary)">Switch context</p>
          </div>
          <div className="py-1">
            {contexts.map((ctx, index) => {
              const meta = CONTEXT_META[ctx.context] || { label: ctx.context, icon: '📁', href: '#' };
              const isActive = ctx.context === currentContext && ctx.entityId === contexts.find(c => c.context === currentContext)?.entityId;

              return (
                <button
                  key={`${ctx.context}-${ctx.entityId || index}`}
                  onClick={() => handleSwitch(ctx)}
                  disabled={switching}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    'hover:bg-(--background)',
                    isActive && 'bg-accent/10'
                  )}
                >
                  <span className="text-lg">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-accent' : 'text-(--primary)'
                    )}>
                      {ctx.name || meta.label}
                    </p>
                    {ctx.role && (
                      <p className="text-xs text-(--secondary) capitalize">{ctx.role}</p>
                    )}
                  </div>
                  {isActive && (
                    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
