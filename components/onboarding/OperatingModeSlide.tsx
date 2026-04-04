'use client';

import { SelectionCard } from '@/components/ui';
import { operatingModeLabels, OperatingMode } from '@/lib/types';
import { cn } from '@/lib/utils';

interface OperatingModeSlideProps {
    value: OperatingMode | null;
    onChange: (value: OperatingMode) => void;
    className?: string;
}

export default function OperatingModeSlide({ value, onChange, className }: OperatingModeSlideProps) {
    const options = Object.entries(operatingModeLabels) as [OperatingMode, typeof operatingModeLabels[OperatingMode]][];

    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    What&apos;s your scope?
                </h2>
                <p className="text-(--secondary)">
                    Select your geographical scope.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map(([mode, { label, icon }]) => (
                    <SelectionCard
                        key={mode}
                        label={label}
                        icon={icon}
                        selected={value === mode}
                        onClick={() => onChange(mode)}
                        className="h-full"
                    />
                ))}
            </div>
        </div>
    );
}
