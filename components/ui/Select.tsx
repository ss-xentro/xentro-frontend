'use client';

import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface SelectOption {
    value: string;
    label: string;
    icon?: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    label?: string;
    error?: string;
    className?: string;
}

export function Select({
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    label,
    error,
    className,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cn('w-full', className)} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        `w-full h-12 px-4 flex items-center justify-between
            bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)]
            text-left transition-all duration-200
            hover:border-[var(--secondary-light)]
            focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)]`,
                        error && 'border-[var(--error)]',
                        isOpen && 'border-[var(--accent)] ring-2 ring-[var(--accent-light)]'
                    )}
                >
                    <span className={cn(
                        'flex items-center gap-2',
                        selectedOption ? 'text-[var(--primary)]' : 'text-[var(--secondary-light)]'
                    )}>
                        {selectedOption?.icon && <span>{selectedOption.icon}</span>}
                        {selectedOption?.label || placeholder}
                    </span>
                    <svg
                        className={cn(
                            'w-5 h-5 text-[var(--secondary)] transition-transform duration-200',
                            isOpen && 'rotate-180'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] animate-scaleIn">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'w-full px-4 py-2.5 flex items-center gap-2 text-left transition-colors',
                                    option.value === value
                                        ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                                        : 'text-[var(--primary)] hover:bg-[var(--surface-hover)]'
                                )}
                            >
                                {option.icon && <span>{option.icon}</span>}
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-2 text-sm text-[var(--error)]">{error}</p>
            )}
        </div>
    );
}
