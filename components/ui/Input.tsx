'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, icon, type = 'text', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-(--primary) mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--secondary)">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={type}
                        className={cn(
                            `w-full min-h-11 h-12 px-4 text-(--primary) bg-(--surface)
              border border-(--border) rounded-lg
              placeholder:text-(--secondary-light)
              transition-all duration-200 ease-out
              focus:outline-none focus:border-accent focus:ring-2 focus:ring-(--accent-light)
              hover:border-(--secondary-light)
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-(--surface-hover)`,
                            icon ? 'pl-12' : '',
                            error && 'border-error focus:border-error focus:ring-(--error-light)',
                            className
                        )}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
                        onFocus={(e) => {
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            props.onBlur?.(e);
                        }}
                        {...props}
                    />
                </div>
                {error && (
                    <p id={`${props.id}-error`} className="mt-2 text-sm text-error" role="alert">{error}</p>
                )}
                {hint && !error && (
                    <p id={`${props.id}-hint`} className="mt-2 text-sm text-(--secondary)">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
