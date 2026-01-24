'use client';

import { Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';

interface DescriptionSlideProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function DescriptionSlide({ value, onChange, className }: DescriptionSlideProps) {
    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">
                    Tell us about the institution
                </h2>
                <p className="text-[var(--secondary)]">
                    Provide a detailed description of their mission, history, and key offerings.
                </p>
            </div>

            <div className="max-w-2xl mx-auto">
                <Textarea
                    label="About"
                    placeholder="Write a compelling description..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="min-h-[250px] text-lg"
                    characterCount
                    maxLength={2000}
                    autoFocus
                />
            </div>
        </div>
    );
}
