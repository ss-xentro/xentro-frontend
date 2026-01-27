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
                    <label className="block text-sm font-medium text-(--primary) mb-2">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    value={value}
                    maxLength={maxLength}
                    className={cn(
                        `w-full min-h-30 px-4 py-3 text-(--primary) bg-(--surface)
            border border-(--border) rounded-lg
            placeholder:text-(--secondary-light)
            transition-all duration-200 ease-out
            focus:outline-none focus:border-accent focus:ring-2 focus:ring-(--accent-light)
            hover:border-(--secondary-light)
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-(--surface-hover)
            resize-none`,
                        error && 'border-error focus:border-error focus:ring-(--error-light)',
                        className
                    )}
                    {...props}
                />
                <div className="flex justify-between mt-2">
                    {error ? (
                        <p className="text-sm text-error">{error}</p>
                    ) : hint ? (
                        <p className="text-sm text-(--secondary)">{hint}</p>
                    ) : (
                        <span />
                    )}
                    {characterCount && maxLength && (
                        <p className={cn(
                            "text-sm",
                            currentLength >= maxLength ? 'text-error' : 'text-(--secondary)'
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
