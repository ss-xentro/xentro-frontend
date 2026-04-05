'use client';

import type { PitchAbout } from './types';
import { RichTextDisplay } from '@/components/ui/RichTextDisplay';

interface PitchAboutCardsProps {
	pitchAbout: PitchAbout | null | undefined;
	description?: string | null;
}

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
		<section className="divide-y divide-(--border)">
			{about && (
				<div className="py-8 first:pt-0">
					<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">About</h2>
					{isHtml(about) ? (
						<RichTextDisplay html={about} className="text-lg leading-8 text-(--primary)" />
					) : (
						<p className="text-lg leading-8 text-(--primary)">{about}</p>
					)}
				</div>
			)}
			{problem && (
				<div className="py-8">
					<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">Problem</h2>
					{isHtml(problem) ? (
						<RichTextDisplay html={problem} className="text-lg leading-8 text-(--primary)" />
					) : (
						<p className="text-lg leading-8 text-(--primary)">{problem}</p>
					)}
				</div>
			)}
			{solution && (
				<div className="py-8 last:pb-0">
					<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">Solution</h2>
					{isHtml(solution) ? (
						<RichTextDisplay html={solution} className="text-lg leading-8 text-(--primary)" />
					) : (
						<p className="text-lg leading-8 text-(--primary)">{solution}</p>
					)}
				</div>
			)}
		</section>
	);
}
