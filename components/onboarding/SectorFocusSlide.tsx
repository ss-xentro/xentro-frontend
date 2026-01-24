'use client';

import { MultiSelectCard } from '@/components/ui';
import { sectorLabels, SectorFocus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SectorFocusSlideProps {
    value: SectorFocus[];
    onChange: (value: SectorFocus[]) => void;
    className?: string;
}

export default function SectorFocusSlide({ value, onChange, className }: SectorFocusSlideProps) {
    const options = Object.entries(sectorLabels) as [SectorFocus, typeof sectorLabels[SectorFocus]][];

    const handleToggle = (sector: SectorFocus) => {
        if (value.includes(sector)) {
            onChange(value.filter((item) => item !== sector));
        } else {
            onChange([...value, sector]);
        }
    };

    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">
                    Sector Focus
                </h2>
                <p className="text-[var(--secondary)]">
                    Which industries does this institution specialize in?
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {options.map(([sector, { label, emoji }]) => (
                    <MultiSelectCard
                        key={sector}
                        label={label}
                        emoji={emoji}
                        selected={value.includes(sector)}
                        onToggle={() => handleToggle(sector)}
                    />
                ))}
            </div>
        </div>
    );
}
