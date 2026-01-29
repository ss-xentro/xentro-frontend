'use client';

import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface InstitutionNameSlideProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function InstitutionNameSlide({ value, onChange, className }: InstitutionNameSlideProps) {
    return (
        <div className={cn('space-y-6', className)} role="region" aria-label="Institution name">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    What should we call your institution?
                </h2>
                <p className="text-(--secondary)">
                    Use your official name — this is how you'll appear to xplorers and mentors.
                </p>
            </div>

            <div className="max-w-md mx-auto">
                <Input
                    label="Institution Name"
                    placeholder="Y Combinator"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoFocus
                    className="text-lg"
                    aria-label="Institution name"
                    aria-required="true"
                />
            </div>
        </div>
    );
}
