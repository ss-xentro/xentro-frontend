'use client';

import type { PitchAbout } from './types';

interface PitchAboutCardsProps {
	pitchAbout: PitchAbout | null | undefined;
	description?: string | null;
}

export function PitchAboutCards({ pitchAbout, description }: PitchAboutCardsProps) {
	return (
		<section>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* About Card */}
				<div className="relative p-6 rounded-2xl border border-(--border) bg-(--surface)/60 backdrop-blur-sm hover:shadow-lg transition-all group overflow-hidden">
					<div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
					<div className="relative">
						<div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
							<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 className="text-lg font-bold text-(--primary) mb-2">About</h3>
						<p className="text-sm text-(--secondary) leading-relaxed">
							{pitchAbout?.about || description || 'No description provided yet.'}
						</p>
					</div>
				</div>

				{/* Problem Statement Card */}
				<div className="relative p-6 rounded-2xl border border-(--border) bg-(--surface)/60 backdrop-blur-sm hover:shadow-lg transition-all group overflow-hidden">
					<div className="absolute inset-0 bg-linear-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
					<div className="relative">
						<div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-4">
							<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
						</div>
						<h3 className="text-lg font-bold text-(--primary) mb-2">Problem Statement</h3>
						<p className="text-sm text-(--secondary) leading-relaxed">
							{pitchAbout?.problemStatement || 'Problem statement coming soon.'}
						</p>
					</div>
				</div>

				{/* Solution Card */}
				<div className="relative p-6 rounded-2xl border border-(--border) bg-(--surface)/60 backdrop-blur-sm hover:shadow-lg transition-all group overflow-hidden">
					<div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
					<div className="relative">
						<div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-4">
							<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
						</div>
						<h3 className="text-lg font-bold text-(--primary) mb-2">Solution Proposed</h3>
						<p className="text-sm text-(--secondary) leading-relaxed">
							{pitchAbout?.solutionProposed || 'Solution details coming soon.'}
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
