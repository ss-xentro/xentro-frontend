'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, icon, type = 'text', ...props }, ref) => {
        const [focused, setFocused] = useState(false);

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--secondary)]">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={type}
                        className={cn(
                            `w-full h-12 px-4 text-[var(--primary)] bg-[var(--surface)]
              border border-[var(--border)] rounded-[var(--radius-lg)]
              placeholder:text-[var(--secondary-light)]
              transition-all duration-200 ease-out
              focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)]
              hover:border-[var(--secondary-light)]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--surface-hover)]`,
                            icon ? 'pl-12' : '',
                            error && 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error-light)]',
                            className
                        )}
                        onFocus={(e) => {
                            setFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setFocused(false);
                            props.onBlur?.(e);
                        }}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-2 text-sm text-[var(--error)]">{error}</p>
                )}
                {hint && !error && (
                    <p className="mt-2 text-sm text-[var(--secondary)]">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
