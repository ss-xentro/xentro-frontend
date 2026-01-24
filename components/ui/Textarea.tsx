'use client';

import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
    characterCount?: boolean;
    maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, hint, characterCount, maxLength, value, ...props }, ref) => {
        const currentLength = typeof value === 'string' ? value.length : 0;

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    value={value}
                    maxLength={maxLength}
                    className={cn(
                        `w-full min-h-[120px] px-4 py-3 text-[var(--primary)] bg-[var(--surface)]
            border border-[var(--border)] rounded-[var(--radius-lg)]
            placeholder:text-[var(--secondary-light)]
            transition-all duration-200 ease-out
            focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)]
            hover:border-[var(--secondary-light)]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--surface-hover)]
            resize-none`,
                        error && 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error-light)]',
                        className
                    )}
                    {...props}
                />
                <div className="flex justify-between mt-2">
                    {error ? (
                        <p className="text-sm text-[var(--error)]">{error}</p>
                    ) : hint ? (
                        <p className="text-sm text-[var(--secondary)]">{hint}</p>
                    ) : (
                        <span />
                    )}
                    {characterCount && maxLength && (
                        <p className={cn(
                            "text-sm",
                            currentLength >= maxLength ? 'text-[var(--error)]' : 'text-[var(--secondary)]'
                        )}>
                            {currentLength}/{maxLength}
                        </p>
                    )}
                </div>
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export { Textarea };
