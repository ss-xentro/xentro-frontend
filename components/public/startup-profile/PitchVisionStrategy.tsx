'use client';

import type { PitchVisionStrategyItem } from './types';
import { RichTextDisplay } from '@/components/ui/RichTextDisplay';

interface PitchVisionStrategyProps {
	items: PitchVisionStrategyItem[];
}

function isHtml(str: string | null | undefined): boolean {
	if (!str) return false;
	return /<[a-z][\s\S]*>/i.test(str);
}

export function PitchVisionStrategy({ items }: PitchVisionStrategyProps) {
	if (items.length === 0) return null;

	return (
		<section>
			<h2 className="text-sm sm:text-base font-semibold uppercase tracking-wide text-(--secondary) mb-4">Vision &amp; Strategy</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{items.map((item, idx) => (
					<div key={idx} className="rounded-xl border border-(--border) bg-(--surface) overflow-hidden flex flex-col hover:border-(--primary)/20 transition-colors">
						{item.icon && (
							<img src={item.icon} alt="" className="w-full h-auto" />
						)}
						<div className="flex-1 p-4">
							<h4 className="text-base font-bold text-(--primary) mb-1">{item.title}</h4>
							{item.description && (
								isHtml(item.description) ? (
									<RichTextDisplay html={item.description} compact className="text-sm text-(--secondary)" />
								) : (
									<p className="text-sm text-(--secondary) leading-relaxed">{item.description}</p>
								)
							)}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
