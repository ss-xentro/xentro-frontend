'use client';

import { SelectionCard } from '@/components/ui';
import { institutionTypeLabels, InstitutionType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface InstitutionTypeSlideProps {
    value: InstitutionType | null;
    onChange: (value: InstitutionType) => void;
    className?: string;
}

export default function InstitutionTypeSlide({ value, onChange, className }: InstitutionTypeSlideProps) {
    const options = Object.entries(institutionTypeLabels) as [InstitutionType, typeof institutionTypeLabels[InstitutionType]][];

    return (
        <div className={cn('space-y-6', className)} role="region" aria-label="Institution type selection">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    What type of institution are you?
                </h2>
                <p className="text-(--secondary)">
                    This helps us tailor your profile for the right audience.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {options.map(([type, { label, emoji, description }]) => (
                    <SelectionCard
                        key={type}
                        label={label}
                        emoji={emoji}
                        description={description}
                        selected={value === type}
                        onClick={() => onChange(type)}
                    />
                ))}
            </div>
        </div>
    );
}
