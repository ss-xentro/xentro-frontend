import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import { ConnectionRequest, STATUS_BADGE, CONNECTION_FILTERS, ConnectionFilter } from '../_lib/constants';

interface ConnectionsListProps {
	connections: ConnectionRequest[];
	filter: ConnectionFilter;
	onFilterChange: (f: ConnectionFilter) => void;
}

export default function ConnectionsList({ connections, filter, onFilterChange }: ConnectionsListProps) {
	const filtered = filter === 'all' ? connections : connections.filter((c) => c.status === filter);

	return (
		<>
			<div className="flex gap-2">
				{CONNECTION_FILTERS.map((f) => (
					<button
						key={f}
						onClick={() => onFilterChange(f)}
						className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === f
							? 'bg-(--surface-hover) text-(--primary) border border-(--border-hover)'
							: 'bg-(--surface) text-(--secondary) border border-(--border) hover:bg-(--surface-hover)'
							}`}
					>
						{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
					</button>
				))}
			</div>

			{filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="w-14 h-14 rounded-full bg-(--surface) flex items-center justify-center mb-3">
						<AppIcon name="brain" className="w-7 h-7 text-(--secondary)" />
					</div>
					<h3 className="text-base font-semibold text-(--primary) mb-1">No connections yet</h3>
					<p className="text-sm text-(--secondary) mb-4">Browse mentors on the explore page and send connection requests.</p>
					<Link href="/explore/mentors" className="text-sm text-(--primary) hover:underline">Explore Mentors →</Link>
				</div>
			) : (
				<div className="space-y-3">
					{filtered.map((conn) => {
						const badge = STATUS_BADGE[conn.status] || STATUS_BADGE.pending;
						return (
							<div key={conn.id} className="flex items-start gap-4 p-4 bg-(--surface) border border-(--border) rounded-xl hover:border-(--secondary-light) transition-colors">
								<div className="w-11 h-11 rounded-full bg-(--surface-hover) flex items-center justify-center text-(--primary) font-bold shrink-0">
									{conn.mentor_user_name?.charAt(0).toUpperCase() || 'M'}
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between gap-3">
										<div className="min-w-0">
											<p className="text-sm font-semibold text-(--primary) truncate">{conn.mentor_user_name || 'Mentor'}</p>
											<p className="text-xs text-(--secondary) truncate">{conn.mentor_user_email}</p>
										</div>
										<span className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>
									</div>
									{conn.message && (
										<p className="text-xs text-(--secondary) mt-1.5 line-clamp-2 italic">&ldquo;{conn.message}&rdquo;</p>
									)}
									<div className="flex items-center gap-4 mt-2.5">
										<span className="text-xs text-(--secondary)">
											Sent {new Date(conn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
										</span>
										{conn.responded_at && (
											<span className="text-xs text-(--secondary)">
												Responded {new Date(conn.responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
											</span>
										)}
									</div>
									{conn.status === 'accepted' && (
										<div className="mt-3 flex gap-2">
											<Link href={`/explore/mentors/${conn.mentor}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-(--surface-hover) text-(--primary) hover:bg-(--surface-pressed) transition-colors">
												<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
												Book Session
											</Link>
											<Link href={`/explore/mentors/${conn.mentor}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-(--border) text-(--secondary) hover:text-(--primary) hover:border-(--secondary-light) transition-colors">
												View Profile
											</Link>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</>
	);
}
