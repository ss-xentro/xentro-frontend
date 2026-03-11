'use client';

import { cn } from '@/lib/utils';
import { COMPLETION_STEPS } from '../_lib/constants';

interface StepProgressBarProps {
	currentStep: number;
}

export function StepProgressBar({ currentStep }: StepProgressBarProps) {
	return (
		<div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-6 sm:mb-8">
			{COMPLETION_STEPS.map((step) => {
				const isActive = step.id === currentStep;
				const isCompleted = step.id < currentStep;
				return (
					<div key={step.id} className="flex items-center gap-1.5 sm:gap-3">
						<div className="flex flex-col items-center">
							<div
								className={cn(
									'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-300',
									isActive
										? 'bg-accent text-white ring-2 sm:ring-4 ring-accent/20 scale-110'
										: isCompleted
											? 'bg-accent text-white'
											: 'bg-(--surface-hover) text-(--secondary)'
								)}
							>
								{isCompleted ? (
									<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								) : (
									step.id
								)}
							</div>
							<span className={cn(
								'mt-1 sm:mt-1.5 text-[10px] sm:text-xs font-medium',
								isActive ? 'text-(--primary)' : 'text-(--secondary)'
							)}>
								{step.title}
							</span>
						</div>
						{step.id < COMPLETION_STEPS.length && (
							<div className={cn(
								'w-6 sm:w-12 h-0.5 mt-[-18px] rounded-full transition-colors',
								step.id < currentStep ? 'bg-accent' : 'bg-(--border)'
							)} />
						)}
					</div>
				);
			})}
		</div>
	);
}
