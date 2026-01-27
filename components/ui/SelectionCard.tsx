'use client';

import { cn } from '@/lib/utils';

interface SelectionCardProps {
    selected: boolean;
    onClick: () => void;
    emoji?: string;
    label: string;
    description?: string;
    className?: string;
    disabled?: boolean;
}

export function SelectionCard({
    selected,
    onClick,
    emoji,
    label,
    description,
    className,
    disabled = false,
}: SelectionCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                `w-full p-5 rounded-xl border-2 text-left
        transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
        disabled:opacity-50 disabled:cursor-not-allowed`,
                selected
                    ? 'border-accent bg-(--accent-subtle) shadow-(--shadow-sm)'
                    : 'border-(--border) bg-(--surface) hover:border-(--secondary-light) hover:shadow-(--shadow-sm)',
                className
            )}
        >
            <div className="flex items-start gap-4">
                {emoji && (
                    <span className="text-2xl" role="img" aria-hidden>
                        {emoji}
                    </span>
                )}
                <div className="flex-1 min-w-0">
                    <h4 className={cn(
                        'font-semibold text-base',
                        selected ? 'text-accent' : 'text-(--primary)'
                    )}>
                        {label}
                    </h4>
                    {description && (
                        <p className="mt-1 text-sm text-(--secondary)">
                            {description}
                        </p>
                    )}
                </div>
                <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                    selected
                        ? 'border-accent bg-accent'
                        : 'border-(--border)'
                )}>
                    {selected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                    )}
                </div>
            </div>
        </button>
    );
}

// Multi-select variant
interface MultiSelectCardProps extends Omit<SelectionCardProps, 'onClick'> {
    onToggle: () => void;
}

export function MultiSelectCard({
    selected,
    onToggle,
    emoji,
    label,
    className,
    disabled = false,
}: MultiSelectCardProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            className={cn(
                `w-full p-4 rounded-lg border-2 text-left
        transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
        disabled:opacity-50 disabled:cursor-not-allowed`,
                selected
                    ? 'border-accent bg-(--accent-subtle)'
                    : 'border-(--border) bg-(--surface) hover:border-(--secondary-light)',
                className
            )}
        >
            <div className="flex items-center gap-3">
                {emoji && (
                    <span className="text-xl" role="img" aria-hidden>
                        {emoji}
                    </span>
                )}
                <span className={cn(
                    'font-medium text-sm flex-1',
                    selected ? 'text-accent' : 'text-(--primary)'
                )}>
                    {label}
                </span>
                <div className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0',
                    selected
                        ? 'border-accent bg-accent'
                        : 'border-(--border)'
                )}>
                    {selected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                    )}
                </div>
            </div>
        </button>
    );
}
