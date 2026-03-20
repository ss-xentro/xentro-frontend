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
			<div className="rounded-2xl border border-slate-300 bg-white p-5 md:p-6">
				<div className="grid grid-cols-1 lg:grid-cols-7 gap-5 md:gap-6 items-start">
					<div className="lg:col-span-4">
						<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Chapter 04 · Intent</p>
						<h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2 text-slate-900">Why are you joining Xentro?</h2>
						<p className="text-sm md:text-base text-slate-700 mt-2 leading-relaxed">Select all that apply. Your goals help us personalize recommendations and opportunities.</p>
					</div>

					<div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
						<div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
							<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Selection</p>
							<p className="text-xs mt-1 text-slate-900">Choose one or more goals</p>
						</div>
						<div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
							<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Required</p>
							<p className="text-xs mt-1 text-slate-900">At least one reason</p>
						</div>
						<div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
							<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Tip</p>
							<p className="text-xs mt-1 text-slate-900">Be specific if you choose Other</p>
						</div>
					</div>
				</div>
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
