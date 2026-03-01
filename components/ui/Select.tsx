'use client';

import { cn } from '@/lib/utils';
import { useState, useRef, useEffect, useId, useCallback } from 'react';

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
    options = [],
    placeholder = 'Select an option',
    label,
    error,
    className,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLDivElement>(null);
    const uid = useId();
    const labelId = `${uid}-label`;
    const listboxId = `${uid}-listbox`;
    const errorId = `${uid}-error`;

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

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    setIsOpen(false);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (!isOpen) {
                        setIsOpen(true);
                        setActiveIndex(0);
                    } else {
                        setActiveIndex((prev) => Math.min(prev + 1, options.length - 1));
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (isOpen) {
                        setActiveIndex((prev) => Math.max(prev - 1, 0));
                    }
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (isOpen && activeIndex >= 0) {
                        onChange(options[activeIndex].value);
                        setIsOpen(false);
                    } else if (!isOpen) {
                        setIsOpen(true);
                        setActiveIndex(0);
                    }
                    break;
                case 'Home':
                    if (isOpen) {
                        e.preventDefault();
                        setActiveIndex(0);
                    }
                    break;
                case 'End':
                    if (isOpen) {
                        e.preventDefault();
                        setActiveIndex(options.length - 1);
                    }
                    break;
            }
        },
        [isOpen, activeIndex, options, onChange]
    );

    return (
        <div className={cn('w-full', className)} ref={containerRef}>
            {label && (
                <label id={labelId} className="block text-sm font-medium text-(--primary) mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-labelledby={label ? labelId : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className={cn(
                        `w-full h-12 px-4 flex items-center justify-between
            bg-(--surface) border border-(--border) rounded-lg
            text-left transition-all duration-200
            hover:border-(--secondary-light)
            focus:outline-none focus:border-accent focus:ring-2 focus:ring-(--accent-light)`,
                        error && 'border-error',
                        isOpen && 'border-accent ring-2 ring-(--accent-light)'
                    )}
                >
                    <span className={cn(
                        'flex items-center gap-2',
                        selectedOption ? 'text-(--primary)' : 'text-(--secondary-light)'
                    )}>
                        {selectedOption?.icon && <span>{selectedOption.icon}</span>}
                        {selectedOption?.label || placeholder}
                    </span>
                    <svg
                        className={cn(
                            'w-5 h-5 text-(--secondary) transition-transform duration-200',
                            isOpen && 'rotate-180'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div
                        ref={listboxRef}
                        id={listboxId}
                        role="listbox"
                        aria-labelledby={label ? labelId : undefined}
                        className="absolute z-50 w-full mt-2 py-2 bg-(--surface) border border-(--border) rounded-lg shadow-(--shadow-lg) animate-scaleIn"
                    >
                        {options.map((option, index) => (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={option.value === value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={cn(
                                    'w-full px-4 py-2.5 flex items-center gap-2 text-left transition-colors',
                                    option.value === value
                                        ? 'bg-(--accent-subtle) text-accent'
                                        : 'text-(--primary) hover:bg-(--surface-hover)',
                                    index === activeIndex && 'bg-(--surface-hover)'
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
                <p id={errorId} className="mt-2 text-sm text-error" role="alert">{error}</p>
            )}
        </div>
    );
}
