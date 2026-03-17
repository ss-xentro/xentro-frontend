import { Card } from '@/components/ui';
import { TeamMember, ROLE_LABELS } from '../institution-tabs-config';

export default function TeamTab({ team }: { team: TeamMember[] }) {
	if (team.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center">
					<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-white mb-2">No team members listed yet</h3>
				<p className="text-gray-400 max-w-md mx-auto">
					This institution hasn&apos;t added team member profiles yet.
				</p>
			</div>
		);
	}

	return (
		<div>
			<h2 className="text-xl font-bold text-white mb-4">Team Members</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{team.map((member) => {
					const roleInfo = ROLE_LABELS[member.role] || ROLE_LABELS.viewer;
					return (
						<Card key={member.id} className="p-6 bg-white/5 border-white/10 border" hoverable>
							<div className="flex items-start gap-4">
								<div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-xl font-bold text-violet-300 shrink-0">
									{member.user?.name?.[0]?.toUpperCase() || '?'}
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-bold text-white truncate">
										{member.user?.name || 'Unknown User'}
									</h3>
									<p className="text-sm text-gray-400 truncate">
										{member.user?.email || ''}
									</p>
									<span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
										{roleInfo.label}
									</span>
								</div>
							</div>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
