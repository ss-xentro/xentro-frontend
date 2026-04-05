'use client';

import { cn } from '@/lib/utils';
import { RichTextDisplay } from '@/components/ui/RichTextDisplay';

interface ImageTextItem {
	title: string;
	description?: string | null;
	imageUrl?: string | null;
}

interface PitchImageTextSectionProps {
	title: string;
	items: ImageTextItem[];
}

function isHtml(str: string | null | undefined): boolean {
	if (!str) return false;
	return /<[a-z][\s\S]*>/i.test(str);
}

export function PitchImageTextSection({ title, items }: PitchImageTextSectionProps) {
	if (items.length === 0) return null;

	return (
		<section>
			<h2 className="text-sm sm:text-base font-semibold uppercase tracking-wide text-(--secondary) mb-4">{title}</h2>
			<div className={cn('grid gap-4', items.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2')}>
				{items.map((item, idx) => (
					<div key={idx} className="flex flex-col rounded-xl border border-(--border) bg-(--surface) overflow-hidden">
						{item.imageUrl && (
							<img src={item.imageUrl} alt={item.title} className="w-full h-auto" />
						)}
						<div className="flex-1 p-5">
							<h3 className="text-base font-bold text-(--primary) mb-2">{item.title}</h3>
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
