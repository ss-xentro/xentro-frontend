'use client';

import { cn } from '@/lib/utils';
import { COMPLETION_STEPS } from '../_lib/constants';

interface StepProgressBarProps {
	currentStep: number;
}

export function StepProgressBar({ currentStep }: StepProgressBarProps) {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
			{COMPLETION_STEPS.map((step) => {
				const isActive = step.id === currentStep;
				const isCompleted = step.id < currentStep;
				return (
					<div
						key={step.id}
						className={cn(
							'relative rounded-xl border px-3 py-2.5 sm:px-3.5 sm:py-3 transition-all duration-200',
							isActive
								? 'border-slate-900 bg-slate-100 shadow-[0_6px_16px_rgba(15,23,42,0.08)]'
								: isCompleted
									? 'border-slate-300 bg-slate-50'
									: 'border-(--border) bg-white'
						)}
					>
						<div className="flex items-start gap-2.5">
							<div
								className={cn(
									'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-200 shrink-0',
									isActive
										? 'bg-slate-900 text-white'
										: isCompleted
											? 'bg-slate-700 text-white'
											: 'bg-(--surface-hover) text-(--secondary)'
								)}
							>
								{isCompleted ? (
									<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								) : (
									step.id
								)}
							</div>

							<div className="min-w-0">
								<p className="text-[10px] uppercase tracking-wide text-(--secondary)">Step {step.id}</p>
								<p className={cn(
									'text-xs sm:text-sm font-semibold leading-tight',
									isActive ? 'text-(--primary)' : 'text-(--primary)'
								)}>
									{step.title}
								</p>
								<p className="text-[11px] sm:text-xs text-(--secondary) leading-tight mt-0.5 line-clamp-2">{step.subtitle}</p>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
