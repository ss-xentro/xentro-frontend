'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outlined' | 'elevated';
    hoverable?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', hoverable = false, padding = 'md', children, ...props }, ref) => {
        const variants = {
            default: 'bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)]',
            outlined: 'bg-transparent border border-[var(--border)]',
            elevated: 'bg-[var(--surface)] shadow-[var(--shadow-lg)]',
        };

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    `rounded-[var(--radius-xl)] transition-all duration-200`,
                    variants[variant],
                    paddings[padding],
                    hoverable && 'hover:shadow-[var(--shadow-md)] hover:border-[var(--secondary-light)] cursor-pointer',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export { Card };
