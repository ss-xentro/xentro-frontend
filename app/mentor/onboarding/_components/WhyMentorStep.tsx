'use client';

import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/ui/AppIcon';
import { Input } from '@/components/ui/Input';
import { WHY_MENTOR_OPTIONS } from '../_lib/constants';

interface WhyMentorStepProps {
	selectedValues: string[];
	otherText: string;
	onToggle: (value: string) => void;
	onOtherChange: (value: string) => void;
}

export function WhyMentorStep({ selectedValues, otherText, onToggle, onOtherChange }: WhyMentorStepProps) {
	return (
		<div className="space-y-6 animate-fadeIn">
			<div>
				<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--secondary)">Intent</p>
				<h2 className="text-xl md:text-2xl font-semibold tracking-tight mt-1 text-(--primary)">Why do you want to mentor?</h2>
				<p className="text-sm text-(--primary-light) mt-1.5">Select one or more to personalize your experience.</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{WHY_MENTOR_OPTIONS.map(opt => {
					const isSelected = selectedValues.includes(opt.value);
					const isOther = opt.value === 'Other';
					return (
						<div key={opt.value} className={cn('flex h-full flex-col', isOther && 'md:col-span-2')}>
							<label className={cn(
								'group flex h-full cursor-pointer rounded-xl border p-3 transition-all duration-200',
								isSelected
									? 'border-(--border-focus) bg-(--surface-pressed) shadow-[0_8px_24px_rgba(0,0,0,0.2)] ring-1 ring-(--border-hover)'
									: 'border-(--border) bg-(--surface) hover:-translate-y-0.5 hover:border-(--border-hover) hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]'
							)}>
								<input
									type="checkbox"
									checked={isSelected}
									onChange={() => onToggle(opt.value)}
									className="sr-only"
								/>

								<div className="flex w-full items-start gap-3">
									<div className={cn(
										'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
										isSelected
											? 'border-(--border-focus) bg-(--surface-pressed) text-(--primary)'
											: 'border-(--border) bg-(--surface-secondary) text-(--secondary) group-hover:text-(--primary)'
									)}>
										<AppIcon name={opt.icon} className="h-4 w-4" />
									</div>

									<div className="min-w-0 flex-1">
										<div className="flex items-start justify-between gap-2">
											<div>
												<p className={cn(
													'text-xs font-semibold',
													isSelected ? 'text-(--primary)' : 'text-(--primary)'
												)}>
													{opt.title}
												</p>
												<p className="mt-0.5 text-xs leading-5 text-(--secondary)">{opt.description}</p>
											</div>

											<div className={cn(
												'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors',
												isSelected
													? 'border-(--border-focus) bg-(--primary) text-(--background)'
													: 'border-(--secondary-light) bg-(--surface) text-transparent'
											)}>
												<AppIcon name="check" className="h-3 w-3" />
											</div>
										</div>

										{isOther && isSelected && (
											<div className="mt-3 border-t border-(--border) pt-3" onClick={e => e.stopPropagation()}>
												<Input
													placeholder="Tell us more..."
													value={otherText}
													onChange={e => onOtherChange(e.target.value)}
													autoFocus
												/>
											</div>
										)}
									</div>
								</div>
							</label>
						</div>
					);
				})}
			</div>
		</div>
	);
}
