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
        <div className={cn('w-full max-w-md mx-auto', className)}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xs sm:text-sm font-medium text-(--primary)">
                    Step {currentStep} of {totalSteps}
                </span>
                <span className="text-xs sm:text-sm text-(--secondary)">
                    {Math.round(progress)}% complete
                </span>
            </div>
            <div className="h-1.5 sm:h-2 bg-(--border-light) rounded-(--radius-full) overflow-hidden">
                <div
                    className="h-full bg-accent rounded-(--radius-full) transition-all duration-500 ease-out"
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
        <div className={cn('flex items-center justify-center gap-1.5 sm:gap-2', className)}>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div
                    key={step}
                    className={cn(
                        'h-1.5 sm:h-2 rounded-full transition-all duration-300',
                        step === currentStep
                            ? 'w-5 sm:w-6 bg-accent'
                            : step < currentStep
                                ? 'w-1.5 sm:w-2 bg-accent'
                                : 'w-1.5 sm:w-2 bg-(--border)'
                    )}
                />
            ))}
        </div>
    );
}
