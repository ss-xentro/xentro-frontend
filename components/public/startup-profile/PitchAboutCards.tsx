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
		<section className="space-y-10">
			{/* About — full width, prominent */}
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

			{/* Problem & Solution — side by side */}
			{(problem || solution) && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{problem && (
						<div className="p-5 rounded-xl border border-(--border) bg-(--surface)">
							<div className="flex items-center gap-2 mb-3">
								<span className="w-6 h-6 rounded-md bg-red-50 text-red-500 flex items-center justify-center text-sm">!</span>
								<h3 className="text-sm font-semibold text-(--primary)">Problem</h3>
							</div>
							{isHtml(problem) ? (
								<RichTextDisplay html={problem} compact className="text-sm text-(--secondary)" />
							) : (
								<p className="text-sm text-(--secondary) leading-relaxed">{problem}</p>
							)}
						</div>
					)}
					{solution && (
						<div className="p-5 rounded-xl border border-(--border) bg-(--surface)">
							<div className="flex items-center gap-2 mb-3">
								<span className="w-6 h-6 rounded-md bg-green-50 text-green-600 flex items-center justify-center text-sm">&#10003;</span>
								<h3 className="text-sm font-semibold text-(--primary)">Solution</h3>
							</div>
							{isHtml(solution) ? (
								<RichTextDisplay html={solution} compact className="text-sm text-(--secondary)" />
							) : (
								<p className="text-sm text-(--secondary) leading-relaxed">{solution}</p>
							)}
						</div>
					)}
				</div>
			)}
		</section>
	);
}
