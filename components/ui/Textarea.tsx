'use client';

import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef, useId } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
    characterCount?: boolean;
    maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, hint, characterCount, maxLength, value, ...props }, ref) => {
        const autoId = useId();
        const id = props.id || autoId;
        const errorId = `${id}-error`;
        const hintId = `${id}-hint`;
        const countId = `${id}-count`;
        const currentLength = typeof value === 'string' ? value.length : 0;

        const describedBy = [
            error ? errorId : hint ? hintId : null,
            characterCount && maxLength ? countId : null,
        ].filter(Boolean).join(' ') || undefined;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-(--primary) mb-2">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={id}
                    value={value}
                    maxLength={maxLength}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={describedBy}
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
                        <p id={errorId} className="text-sm text-error" role="alert">{error}</p>
                    ) : hint ? (
                        <p id={hintId} className="text-sm text-(--secondary)">{hint}</p>
                    ) : (
                        <span />
                    )}
                    {characterCount && maxLength && (
                        <p id={countId} aria-live="polite" className={cn(
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
