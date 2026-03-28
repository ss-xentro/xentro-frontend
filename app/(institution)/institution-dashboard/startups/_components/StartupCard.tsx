import { useRouter } from 'next/navigation';
import { Card, Spinner } from '@/components/ui';
import { Startup, formatStage } from '../_lib/constants';

interface StartupCardProps {
	startup: Startup;
	deleting: boolean;
	onDelete: (id: string) => void;
}

export default function StartupCard({ startup, deleting, onDelete }: StartupCardProps) {
	const router = useRouter();

	return (
		<Card
			className="p-6 bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
			onClick={() => router.push(`/institution-dashboard/startups/${startup.id}`)}
		>
			<div className="flex items-start justify-between mb-4">
				<div className="flex-1">
					<h3 className="font-bold text-lg text-white mb-1">{startup.name}</h3>
					<span className="inline-block px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded">
						{formatStage(startup.stage)}
					</span>
				</div>
				<div className="flex items-center gap-1">
					<button
						onClick={(e) => { e.stopPropagation(); router.push(`/institution-dashboard/startups/${startup.id}/edit`); }}
						className="p-2 text-gray-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
						aria-label="Edit startup"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
					</button>
					<button
						onClick={(e) => { e.stopPropagation(); onDelete(startup.id); }}
						disabled={deleting}
						className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
						aria-label="Delete startup"
					>
						{deleting ? (
							<Spinner size="sm" />
						) : (
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						)}
					</button>
				</div>
			</div>

			{startup.location && (
				<p className="text-sm text-gray-400 mb-2 flex items-center gap-1">
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					{startup.location}
				</p>
			)}

			{startup.oneLiner && (
				<p className="text-sm text-gray-400 line-clamp-3">{startup.oneLiner}</p>
			)}

			<div className="flex gap-2 border-t border-white/10 pt-4 mt-4">
				<button
					onClick={(e) => { e.stopPropagation(); router.push(`/institution-dashboard/startups/${startup.id}`); }}
					className="flex-1 px-3 py-2 text-sm font-medium text-gray-200 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
				>
					View Details
				</button>
			</div>
		</Card>
	);
}
