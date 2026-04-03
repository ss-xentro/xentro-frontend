"use client";

import { Card } from '@/components/ui';
import { AppIcon } from '@/components/ui/AppIcon';

const STEPS = [
	{ label: 'Institution Type', icon: 'landmark' },
	{ label: 'Name', icon: 'type' },
	{ label: 'Tagline', icon: 'quote' },
	{ label: 'Location', icon: 'map-pin' },
	{ label: 'Operating Mode', icon: 'globe' },
	{ label: 'Impact Metrics', icon: 'bar-chart-2' },
	{ label: 'Funding Impact', icon: 'dollar-sign' },
	{ label: 'SDG Focus', icon: 'target' },
	{ label: 'Sector Focus', icon: 'layers' },
	{ label: 'Logo Upload', icon: 'image' },
	{ label: 'Website & Links', icon: 'link' },
	{ label: 'Contact Details', icon: 'mail' },
	{ label: 'Legal Documents', icon: 'file-text' },
	{ label: 'Description', icon: 'align-left' },
	{ label: 'Review & Publish', icon: 'check-circle' },
] as const;

interface StepNavigationSidebarProps {
	currentStep: number;
	totalSteps: number;
	onStepClick: (step: number) => void;
	/** Returns true when the given 1-based step has valid data */
	isStepComplete?: (step: number) => boolean;
	/** When true, show a compact minimized view */
	collapsed?: boolean;
}

export default function StepNavigationSidebar({
	currentStep,
	totalSteps,
	onStepClick,
	isStepComplete,
	collapsed = false,
}: StepNavigationSidebarProps) {
	if (collapsed) {
		return (
			<Card className="p-3 sticky top-6">
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-xs font-semibold text-(--secondary) uppercase tracking-wide">
						Step {currentStep} of {totalSteps}
					</h3>
					<span className="text-xs text-(--secondary)">
						{STEPS[currentStep - 1]?.label}
					</span>
				</div>
				<nav aria-label="Onboarding steps">
					<ol className="flex flex-wrap gap-1.5">
						{STEPS.slice(0, totalSteps).map((step, idx) => {
							const stepNum = idx + 1;
							const isCurrent = stepNum === currentStep;
							const completed = isStepComplete?.(stepNum) ?? stepNum < currentStep;

							return (
								<li key={stepNum}>
									<button
										type="button"
										onClick={() => onStepClick(stepNum)}
										aria-current={isCurrent ? 'step' : undefined}
										title={step.label}
										className={`
											w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-colors
											${isCurrent
												? 'bg-accent text-(--background) border-accent'
												: completed
													? 'bg-green-500 text-white border-green-500'
													: 'bg-(--surface) text-(--secondary) border-(--border) hover:bg-(--surface-hover)'
											}
										`}
									>
										{completed && !isCurrent ? (
											<AppIcon name="check" className="w-3 h-3" />
										) : (
											stepNum
										)}
									</button>
								</li>
							);
						})}
					</ol>
				</nav>
			</Card>
		);
	}

	return (
		<Card className="p-4 sticky top-6">
			<h3 className="text-sm font-semibold text-(--secondary) uppercase tracking-wide mb-3">
				Steps
			</h3>

			<nav aria-label="Onboarding steps">
				<ol className="space-y-1">
					{STEPS.slice(0, totalSteps).map((step, idx) => {
						const stepNum = idx + 1;
						const isCurrent = stepNum === currentStep;
						const completed = isStepComplete?.(stepNum) ?? stepNum < currentStep;

						return (
							<li key={stepNum}>
								<button
									type="button"
									onClick={() => onStepClick(stepNum)}
									aria-current={isCurrent ? 'step' : undefined}
									className={`
                    w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors
                    ${isCurrent
											? 'bg-accent/10 text-accent font-semibold'
											: completed
												? 'text-(--primary) hover:bg-(--surface-hover)'
												: 'text-(--secondary) hover:bg-(--surface-hover)'
										}
                  `}
								>
									{/* Step indicator */}
									<span
										className={`
                      shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border transition-colors
                      ${isCurrent
												? 'bg-accent text-(--background) border-accent'
												: completed
													? 'bg-green-500 text-white border-green-500'
													: 'bg-(--surface) text-(--secondary) border-(--border)'
											}
                    `}
									>
										{completed && !isCurrent ? (
											<AppIcon name="check" className="w-3.5 h-3.5" />
										) : (
											stepNum
										)}
									</span>

									{/* Label */}
									<span className="truncate">{step.label}</span>
								</button>
							</li>
						);
					})}
				</ol>
			</nav>
		</Card>
	);
}
