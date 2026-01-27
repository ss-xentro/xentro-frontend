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
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    What is the institution&apos;s name?
                </h2>
                <p className="text-(--secondary)">
                    Enter the official name as it should appear on the platform.
                </p>
            </div>

            <div className="max-w-md mx-auto">
                <Input
                    label="Institution Name"
                    placeholder="e.g. Y Combinator"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoFocus
                    className="text-lg"
                />
            </div>
        </div>
    );
}
