'use client';

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
			<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-8">{title}</h2>
			<div className="divide-y divide-(--border)">
				{items.map((item, idx) => (
					<div key={idx} className="py-8 first:pt-0 last:pb-0">
						{item.imageUrl && (
							<img src={item.imageUrl} alt={item.title} className="w-full h-auto mb-6 rounded-lg" />
						)}
						<h3 className="text-2xl font-bold text-(--primary) mb-3">{item.title}</h3>
						{item.description && (
							isHtml(item.description) ? (
								<RichTextDisplay html={item.description} className="text-lg leading-8 text-(--secondary)" />
							) : (
								<p className="text-lg leading-8 text-(--secondary)">{item.description}</p>
							)
						)}
					</div>
				))}
			</div>
		</section>
	);
}
