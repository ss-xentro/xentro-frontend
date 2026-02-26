'use client';

import { cn } from '@/lib/utils';

interface ImageTextItem {
	title: string;
	description?: string | null;
	imageUrl?: string | null;
}

interface PitchImageTextSectionProps {
	title: string;
	items: ImageTextItem[];
}

export function PitchImageTextSection({ title, items }: PitchImageTextSectionProps) {
	if (items.length === 0) return null;

	return (
		<section>
			<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">{title}</h2>
			<div className="space-y-4">
				{items.map((item, idx) => (
					<div key={idx} className={cn(
						'flex flex-col md:flex-row gap-5 items-start p-5 rounded-xl border border-(--border) bg-(--surface)',
						idx % 2 !== 0 && 'md:flex-row-reverse'
					)}>
						{item.imageUrl && (
							<div className="w-full md:w-2/5 rounded-lg overflow-hidden bg-(--surface-hover) shrink-0">
								<img src={item.imageUrl} alt={item.title} className="w-full h-44 object-cover" />
							</div>
						)}
						<div className={cn('w-full', item.imageUrl ? 'md:w-3/5' : '')}>
							<h3 className="text-sm font-semibold text-(--primary) mb-2">{item.title}</h3>
							{item.description && (
								<p className="text-sm text-(--secondary) leading-relaxed">{item.description}</p>
							)}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
