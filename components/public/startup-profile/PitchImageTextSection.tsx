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

/** Check if a string contains HTML tags */
function isHtml(str: string | null | undefined): boolean {
	if (!str) return false;
	return /<[a-z][\s\S]*>/i.test(str);
}

export function PitchImageTextSection({ title, items }: PitchImageTextSectionProps) {
	if (items.length === 0) return null;

	return (
		<section>
			<h2 className="text-sm sm:text-base font-semibold uppercase tracking-wide text-(--secondary) mb-4">{title}</h2>
			<div className="space-y-4">
				{items.map((item, idx) => (
					<div key={idx} className={cn(
						'flex flex-col gap-5 items-start p-5 rounded-xl border border-(--border) bg-(--surface)'
					)}>
						{item.imageUrl && (
							<div className="w-full rounded-lg overflow-hidden bg-(--surface-hover) shrink-0">
								<img src={item.imageUrl} alt={item.title} className="w-full h-auto" />
							</div>
						)}
						<div className="w-full">
							<h3 className="text-sm font-semibold text-(--primary) mb-2">{item.title}</h3>
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
