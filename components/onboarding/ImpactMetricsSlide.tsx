'use client';

import { Input } from '@/components/ui';
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
                    What is their impact?
                </h2>
                <p className="text-(--secondary)">
                    Share key metrics to highlight their achievements.
                </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                <Input
                    label="Startups Supported"
                    type="number"
                    placeholder="0"
                    value={startupsSupported === 0 ? '' : startupsSupported}
                    onChange={(e) => onStartupsChange(parseInt(e.target.value) || 0)}
                    icon={
                        <span role="img" aria-label="rocket">
                            🚀
                        </span>
                    }
                    autoFocus
                />

                <Input
                    label="People Mentored"
                    type="number"
                    placeholder="0"
                    value={studentsMentored === 0 ? '' : studentsMentored}
                    onChange={(e) => onStudentsChange(parseInt(e.target.value) || 0)}
                    icon={
                        <span role="img" aria-label="student">
                            🎓
                        </span>
                    }
                />
            </div>
        </div>
    );
}
