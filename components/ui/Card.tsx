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
            default: 'bg-(--surface) border border-(--border) shadow-[var(--shadow-sm)]',
            outlined: 'bg-transparent border border-(--border)',
            elevated: 'bg-(--surface) shadow-(--shadow-lg)',
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
                    `rounded-xl transition-all duration-200`,
                    variants[variant],
                    paddings[padding],
                    hoverable && 'hover:shadow-(--shadow-md) hover:border-(--secondary-light) cursor-pointer',
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
