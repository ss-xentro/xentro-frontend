'use client';

import { MultiSelectCard, SDGBadge } from '@/components/ui';
import { sdgLabels, SDGFocus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SDGFocusSlideProps {
    value: SDGFocus[];
    onChange: (value: SDGFocus[]) => void;
    className?: string;
}

export default function SDGFocusSlide({ value, onChange, className }: SDGFocusSlideProps) {
    const options = Object.entries(sdgLabels) as [SDGFocus, typeof sdgLabels[SDGFocus]][];

    const handleToggle = (sdg: SDGFocus) => {
        if (value.includes(sdg)) {
            onChange(value.filter((item) => item !== sdg));
        } else {
            if (value.length < 3) {
                onChange([...value, sdg]);
            }
        }
    };

    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    Sustainable Development Goals
                </h2>
                <p className="text-(--secondary)">
                    Select up to 3 SDGs that this institution primarily targets.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-125 overflow-y-auto pr-2">
                {options.map(([sdg, { label, fullName }]) => (
                    <MultiSelectCard
                        key={sdg}
                        label={fullName}
                        emoji={label} // Using label (SDG 4) as emoji slot for layout
                        selected={value.includes(sdg)}
                        onToggle={() => handleToggle(sdg)}
                        disabled={!value.includes(sdg) && value.length >= 3}
                    />
                ))}
            </div>

            <div className="flex gap-2 justify-center flex-wrap mt-4">
                {value.map((sdg) => (
                    <SDGBadge key={sdg} sdg={sdgLabels[sdg].label} color={sdgLabels[sdg].color} />
                ))}
            </div>
        </div>
    );
}
