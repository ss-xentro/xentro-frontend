'use client';

interface MentorPackagesProps {
	hourlyRate: number | null;
	packages: string[];
	connectionStatus: string | null;
	connectBtnDisabled: boolean;
	onConnectOrBook: () => void;
}

export default function MentorPackages({ hourlyRate, packages, connectionStatus, connectBtnDisabled, onConnectOrBook }: MentorPackagesProps) {
	return (
		<div className="space-y-5">
			{/* Free session offering */}
			<div className="bg-white/3 border border-white/6 rounded-xl p-5">
				<h3 className="text-sm font-semibold text-white mb-1">One-Time Session (30 min)</h3>
				<p className="text-2xl font-bold text-white mb-4">Free</p>
				<ul className="space-y-2 mb-5">
					{['Quick consultation', 'Q&A session', 'General advice'].map((item) => (
						<li key={item} className="flex items-center gap-2 text-sm text-gray-400">
							<svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
							</svg>
							{item}
						</li>
					))}
				</ul>
				<button onClick={onConnectOrBook} disabled={connectBtnDisabled} className="w-full py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-default">
					{connectionStatus === 'accepted' ? 'Book Free Session' : 'Schedule Free Call'}
				</button>
			</div>

			{/* Paid session */}
			{hourlyRate && (
				<div className="bg-white/3 border border-white/6 rounded-xl p-5">
					<h3 className="text-sm font-semibold text-white mb-1">One-Time Session (60 min)</h3>
					<p className="text-2xl font-bold text-white mb-1">${Number(hourlyRate).toLocaleString()}</p>
					<ul className="space-y-2 mb-5 mt-4">
						{['Deep dive session', 'Detailed feedback', 'Action plan'].map((item) => (
							<li key={item} className="flex items-center gap-2 text-sm text-gray-400">
								<svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
								</svg>
								{item}
							</li>
						))}
					</ul>
					<button onClick={onConnectOrBook} disabled={connectBtnDisabled} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-default">
						{connectionStatus === 'accepted' ? 'Book Paid Session' : 'Book Now'}
					</button>
				</div>
			)}

			{/* Custom packages */}
			{packages.length > 0 && (
				<div className="bg-white/3 border border-white/6 rounded-xl p-5">
					<h3 className="text-sm font-semibold text-white mb-3">Mentorship Packages</h3>
					<ul className="space-y-2.5">
						{packages.map((pkg, i) => (
							<li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
								<div className="w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
									<span className="text-[10px] font-bold text-violet-400">{i + 1}</span>
								</div>
								{pkg}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
