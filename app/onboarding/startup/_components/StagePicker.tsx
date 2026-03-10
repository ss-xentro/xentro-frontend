'use client';

import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/ui/AppIcon';
import { STAGE_OPTIONS } from '../_lib/constants';

type StageValue = typeof STAGE_OPTIONS[number]['value'];

interface StagePickerProps {
	selectedStage: string;
	onSelect: (stage: StageValue) => void;
}
export function StagePicker({ selectedStage, onSelect }: StagePickerProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
			{STAGE_OPTIONS.map(opt => {
				const isSelected = selectedStage === opt.value;
				return (
					<button
						key={opt.value}
						type="button"
						onClick={() => onSelect(opt.value)}
						className={cn(
							'p-4 rounded-xl border text-left transition-all duration-200 group',
							isSelected
								? 'border-accent bg-accent/5 ring-2 ring-accent/20'
								: 'border-(--border) hover:border-accent/30 hover:bg-(--surface-hover)'
						)}
					>
						<div className="flex items-center gap-3">
							<AppIcon name={opt.icon} className="w-6 h-6" />
							<div>
								<p className={cn(
									'font-semibold text-sm',
									isSelected ? 'text-accent' : 'text-(--primary)'
								)}>{opt.label}</p>
								<p className="text-xs text-(--secondary)">{opt.description}</p>
							</div>
						</div>
					</button>
				);
			})}
		</div>
	);
}
