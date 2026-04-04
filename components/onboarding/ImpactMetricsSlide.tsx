'use client';

import { Input } from '@/components/ui';
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';

interface ImpactMetricsSlideProps {
    startupsSupported: number;
    studentsMentored: number;
    onStartupsChange: (value: number) => void;
    onStudentsChange: (value: number) => void;
    className?: string;
}

export default function ImpactMetricsSlide({
    startupsSupported,
    studentsMentored,
    onStartupsChange,
    onStudentsChange,
    className,
}: ImpactMetricsSlideProps) {
    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    What&apos;s your impact?
                </h2>
                <p className="text-(--secondary)">
                    Share your key metrics.
                </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                <Input
                    label="Startups Supported"
                    type="number"
                    placeholder="0"
                    value={startupsSupported === 0 ? '' : startupsSupported}
                    onChange={(e) => onStartupsChange(parseInt(e.target.value) || 0)}
                    icon={<AppIcon name="rocket" className="w-5 h-5 text-(--secondary)" />}
                    autoFocus
                />

                <Input
                    label="People Mentored"
                    type="number"
                    placeholder="0"
                    value={studentsMentored === 0 ? '' : studentsMentored}
                    onChange={(e) => onStudentsChange(parseInt(e.target.value) || 0)}
                    icon={<AppIcon name="graduation-cap" className="w-5 h-5 text-(--secondary)" />}
                />
            </div>
        </div>
    );
}
