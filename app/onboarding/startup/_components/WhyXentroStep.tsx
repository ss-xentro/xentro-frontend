'use client';

import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/ui/AppIcon';
import { Input } from '@/components/ui/Input';
import { WHY_XENTRO_OPTIONS } from '../_lib/constants';

interface WhyXentroStepProps {
	selectedValues: string[];
	otherText: string;
	onToggle: (value: string) => void;
	onOtherChange: (value: string) => void;
}

export function WhyXentroStep({ selectedValues, otherText, onToggle, onOtherChange }: WhyXentroStepProps) {
	return (
		<div className="p-6 md:p-8 space-y-7 md:space-y-8 animate-fadeIn">
			<div>
				<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Intent</p>
				<h2 className="text-xl md:text-2xl font-semibold tracking-tight mt-1 text-slate-900">Why are you joining Xentro?</h2>
				<p className="text-sm text-slate-700 mt-1.5">Select one or more goals to personalize recommendations.</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{WHY_XENTRO_OPTIONS.map(opt => {
					const isSelected = selectedValues.includes(opt.value);
					const isOther = opt.value === 'Other';
					return (
						<div key={opt.value} className={cn('flex h-full flex-col', isOther && 'md:col-span-2')}>
							<label className={cn(
								'group flex h-full cursor-pointer rounded-xl border p-3 transition-all duration-200',
								isSelected
									? 'border-slate-900 bg-slate-100 shadow-[0_8px_24px_rgba(16,24,40,0.08)] ring-1 ring-slate-900/10'
									: 'border-(--border) bg-(--surface) hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-[0_8px_24px_rgba(16,24,40,0.06)]'
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
											? 'border-slate-700 bg-slate-700 text-white'
											: 'border-(--border) bg-(--surface-secondary) text-(--secondary) group-hover:text-slate-800'
									)}>
										<AppIcon name={opt.icon} className="h-4 w-4" />
									</div>

									<div className="min-w-0 flex-1">
										<div className="flex items-start justify-between gap-2">
											<div>
												<p className={cn(
													'text-xs font-semibold',
													isSelected ? 'text-slate-900' : 'text-(--primary)'
												)}>
													{opt.title}
												</p>
												<p className="mt-0.5 text-xs leading-5 text-(--secondary)">{opt.description}</p>
											</div>

											<div className={cn(
												'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors',
												isSelected
													? 'border-slate-900 bg-slate-900 text-white'
													: 'border-(--secondary-light) bg-white text-transparent'
											)}>
												<AppIcon name="check" className="h-3 w-3" />
											</div>
										</div>

										{isOther && isSelected && (
											<div className="mt-3 border-t border-(--border) pt-3" onClick={e => e.stopPropagation()}>
												<Input
													placeholder="Please specify your reason"
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
