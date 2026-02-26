'use client';

import type { PitchCompetitor } from './types';

interface PitchCompetitorsProps {
	competitors: PitchCompetitor[];
}

export function PitchCompetitors({ competitors }: PitchCompetitorsProps) {
	if (competitors.length === 0) return null;

	return (
		<section className="relative rounded-2xl overflow-hidden">
			{/* Space-themed background */}
			<div className="absolute inset-0 bg-linear-to-br from-gray-900 via-slate-900 to-indigo-950">
				<div className="absolute inset-0" style={{
					backgroundImage: `radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 80% 50%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 90%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 85%, rgba(255,255,255,0.45) 0%, transparent 100%)`
				}}></div>
			</div>

			<div className="relative p-8">
				<h2 className="text-2xl font-bold text-white mb-2">Competitive Landscape</h2>
				<p className="text-gray-400 mb-6 text-sm">How we stack up against the competition</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{competitors.map((comp, idx) => (
						<div key={idx} className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
									{comp.logo ? (
										<img src={comp.logo} alt={comp.name} className="w-full h-full object-cover" />
									) : (
										<span className="text-sm font-bold text-white/60">{comp.name.charAt(0)}</span>
									)}
								</div>
								<div>
									<h4 className="font-semibold text-white text-sm">{comp.name}</h4>
									{comp.website && (
										<a href={comp.website} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors">
											{comp.website.replace(/^https?:\/\//, '').split('/')[0]}
										</a>
									)}
								</div>
							</div>
							{comp.description && (
								<p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{comp.description}</p>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
