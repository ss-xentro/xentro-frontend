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
								? 'border-(--border-focus) bg-(--surface-pressed) ring-2 ring-(--border-hover)'
								: 'border-(--border) hover:border-(--border-hover) hover:bg-(--surface-hover)'
						)}
					>
						<div className="flex items-center gap-3">
							<div className={cn(
								'flex h-9 w-9 items-center justify-center rounded-lg border',
								isSelected ? 'border-(--border-focus) bg-(--surface-pressed) text-(--primary)' : 'border-(--border) bg-(--surface-secondary) text-(--secondary)'
							)}>
								<AppIcon name={opt.icon} className="w-4 h-4" />
							</div>
							<div>
								<p className={cn(
									'font-semibold text-sm',
									isSelected ? 'text-(--primary)' : 'text-(--primary)'
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
