'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, fullWidth, children, disabled, ...props }, ref) => {
        const baseStyles = `
      inline-flex items-center justify-center font-medium
      transition-all duration-200 ease-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)]
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
    `;

        const variants = {
            primary: `
        bg-[var(--primary)] text-white
        hover:bg-[var(--primary-light)]
        shadow-[var(--shadow-sm)]
        hover:shadow-[var(--shadow-md)]
      `,
            secondary: `
        bg-[var(--surface)] text-[var(--primary)]
        border border-[var(--border)]
        hover:bg-[var(--surface-hover)]
        hover:border-[var(--secondary-light)]
      `,
            ghost: `
        bg-transparent text-[var(--secondary)]
        hover:bg-[var(--surface-hover)]
        hover:text-[var(--primary)]
      `,
            danger: `
        bg-[var(--error)] text-white
        hover:bg-[#DC2626]
        shadow-[var(--shadow-sm)]
      `,
        };

        const sizes = {
            sm: 'h-9 px-4 text-sm rounded-[var(--radius-md)]',
            md: 'h-11 px-6 text-sm rounded-[var(--radius-lg)]',
            lg: 'h-13 px-8 text-base rounded-[var(--radius-lg)]',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth && 'w-full',
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Loading...
                    </>
                ) : children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
