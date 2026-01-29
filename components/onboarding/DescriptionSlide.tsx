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
        <div className={cn('space-y-6', className)} role="region" aria-label="Institution description">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    Describe your institution
                </h2>
                <p className="text-(--secondary)">
                    Share your story, mission, and what makes you unique.
                </p>
            </div>

            <div className="max-w-2xl mx-auto">
                <Textarea
                    id="description"
                    label="About"
                    placeholder="Tell xplorers about your programs, impact, and values..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="min-h-62.5 text-lg"
                    characterCount
                    maxLength={2000}
                    autoFocus
                    aria-label="Institution description"
                />
            </div>
        </div>
    );
}
