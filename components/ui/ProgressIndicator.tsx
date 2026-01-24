'use client';

import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
    className?: string;
}

export function ProgressIndicator({ currentStep, totalSteps, className }: ProgressIndicatorProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className={cn('w-full', className)}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[var(--primary)]">
                    Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-[var(--secondary)]">
                    {Math.round(progress)}% complete
                </span>
            </div>
            <div className="h-2 bg-[var(--border-light)] rounded-[var(--radius-full)] overflow-hidden">
                <div
                    className="h-full bg-[var(--accent)] rounded-[var(--radius-full)] transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

// Step dots variant
interface StepDotsProps {
    currentStep: number;
    totalSteps: number;
    className?: string;
}

export function StepDots({ currentStep, totalSteps, className }: StepDotsProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div
                    key={step}
                    className={cn(
                        'w-2 h-2 rounded-full transition-all duration-300',
                        step === currentStep
                            ? 'w-6 bg-[var(--accent)]'
                            : step < currentStep
                                ? 'bg-[var(--accent)]'
                                : 'bg-[var(--border)]'
                    )}
                />
            ))}
        </div>
    );
}
