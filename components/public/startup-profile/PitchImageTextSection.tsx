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
			<h2 className="text-xl font-bold text-(--primary) mb-6">{title}</h2>
			<div className="space-y-6">
				{items.map((item, idx) => (
					<div key={idx} className={cn(
						'flex flex-col md:flex-row gap-6 items-center',
						idx % 2 !== 0 && 'md:flex-row-reverse'
					)}>
						{item.imageUrl && (
							<div className="w-full md:w-1/2 rounded-xl overflow-hidden border border-(--border) bg-(--surface)">
								<img src={item.imageUrl} alt={item.title} className="w-full h-48 md:h-56 object-cover" />
							</div>
						)}
						<div className={cn('w-full', item.imageUrl ? 'md:w-1/2' : '')}>
							<h3 className="text-lg font-bold text-(--primary) mb-2">{item.title}</h3>
							{item.description && (
								<p className="text-(--secondary) text-sm leading-relaxed">{item.description}</p>
							)}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
