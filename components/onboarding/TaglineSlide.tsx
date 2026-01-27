'use client';

import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface TaglineSlideProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function TaglineSlide({ value, onChange, className }: TaglineSlideProps) {
    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    Add a catchy tagline
                </h2>
                <p className="text-(--secondary)">
                    A short, one-sentence description of the institution&apos;s mission.
                </p>
            </div>

            <div className="max-w-md mx-auto">
                <Input
                    label="Tagline"
                    placeholder="e.g. Make something people want"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={120}
                    hint={`${value.length}/120 characters`}
                    autoFocus
                    className="text-lg"
                />
            </div>
        </div>
    );
}
