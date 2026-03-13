'use client';

import type { PitchAbout } from './types';
import { RichTextDisplay } from '@/components/ui/RichTextDisplay';

interface PitchAboutCardsProps {
	pitchAbout: PitchAbout | null | undefined;
	description?: string | null;
}

/** Check if a string contains HTML tags */
function isHtml(str: string | null | undefined): boolean {
	if (!str) return false;
	return /<[a-z][\s\S]*>/i.test(str);
}

export function PitchAboutCards({ pitchAbout, description }: PitchAboutCardsProps) {
	const about = pitchAbout?.about || description;
	const problem = pitchAbout?.problemStatement;
	const solution = pitchAbout?.solutionProposed;

	if (!about && !problem && !solution) return null;

	return (
		<section className="space-y-8">
			{/* About */}
			{about && (
				<div>
					<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-3">About</h2>
					{isHtml(about) ? (
						<RichTextDisplay html={about} className="text-base sm:text-lg leading-relaxed max-w-3xl" />
					) : (
						<p className="text-base sm:text-lg text-(--primary) leading-relaxed max-w-3xl">{about}</p>
					)}
				</div>
			)}


			{problem && (
				<div>
					<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-3">Problem</h2>
					{isHtml(problem) ? (
						<RichTextDisplay html={problem} className="text-base sm:text-lg leading-relaxed max-w-3xl" />
					) : (
						<p className="text-base sm:text-lg text-(--primary) leading-relaxed max-w-3xl">{problem}</p>
					)}
				</div>
			)}

			{solution && (
				<div>
					<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-3">Solution</h2>
					{isHtml(solution) ? (
						<RichTextDisplay html={solution} className="text-base sm:text-lg leading-relaxed max-w-3xl" />
					) : (
						<p className="text-base sm:text-lg text-(--primary) leading-relaxed max-w-3xl">{solution}</p>
					)}
				</div>
			)}
		</section>
	);
}
