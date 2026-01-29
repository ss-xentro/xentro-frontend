'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'secondary';
    size?: 'sm' | 'md';
    children: React.ReactNode;
    className?: string;
}

export function Badge({ variant = 'default', size = 'sm', children, className }: BadgeProps) {
    const variants = {
        default: 'bg-(--surface-hover) text-(--primary)',
        secondary: 'bg-(--surface-hover) text-(--primary)',
        success: 'bg-(--success-light) text-success',
        warning: 'bg-[var(--warning-light)] text-[#B45309]',
        error: 'bg-(--error-light) text-(--error)',
        info: 'bg-[var(--accent-light)] text-accent',
        outline: 'bg-transparent border border-(--border) text-(--secondary)',
    };

    const sizes = {
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center font-medium rounded-(--radius-full)',
                variants[variant],
                sizes[size],
                className
            )}
        >
            {children}
        </span>
    );
}

// Verified Badge Component
export function VerifiedBadge({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-(--radius-full) bg-(--success-light) text-success',
                className
            )}
        >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
        </span>
    );
}

// Status Badge Component
export function StatusBadge({ status }: { status: 'draft' | 'published' | 'archived' | 'pending' }) {
    const statusConfig = {
        draft: { label: 'Draft', variant: 'warning' as const },
        published: { label: 'Published', variant: 'success' as const },
        archived: { label: 'Archived', variant: 'default' as const },
        pending: { label: 'Pending', variant: 'info' as const },
    };

    const config = statusConfig[status];

    return <Badge variant={config.variant}>{config.label}</Badge>;
}

// SDG Badge Component
export function SDGBadge({ sdg, color }: { sdg: string; color: string }) {
    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-(--radius-full) text-white"
            style={{ backgroundColor: color }}
        >
            {sdg}
        </span>
    );
}
