import { Card, Badge } from '@/components/ui';
import { Startup } from '../institution-tabs-config';

export default function StartupsTab({ startups }: { startups: Startup[] }) {
	if (startups.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center">
					<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-white mb-2">No startups listed yet</h3>
				<p className="text-gray-400 max-w-md mx-auto">
					This institution hasn&apos;t added any startups to their portfolio yet.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{startups.map((startup) => (
				<a key={startup.id} href={`/startups/${startup.slug || startup.id}`} className="block">
					<Card className="flex gap-4 p-6 transition-all bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer" hoverable>
						<div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300 shrink-0 overflow-hidden">
							{startup.logo ? (
								<img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
							) : (
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							)}
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<h3 className="font-bold text-white text-lg truncate">{startup.name}</h3>
								<svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</div>
							{(startup.oneLiner || startup.tagline) && (
								<p className="text-gray-400 mt-1 mb-3 line-clamp-2">{startup.oneLiner || startup.tagline}</p>
							)}
							<div className="flex gap-3 flex-wrap">
								{startup.stage && <Badge variant="outline" className="border-white/20 text-gray-300">{startup.stage}</Badge>}
								{startup.location && (
									<span className="text-sm text-gray-400 flex items-center gap-1">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
										{startup.location}
									</span>
								)}
							</div>
						</div>
					</Card>
				</a>
			))}
		</div>
	);
}
