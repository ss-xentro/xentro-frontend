'use client';

import { Card } from '@/components/ui/Card';
import type { ActivityLog } from './types';

function formatActivityAction(action: string) {
	switch (action) {
		case 'created': return 'Startup profile created';
		case 'updated': return 'Profile updated';
		case 'founder_added': return 'Team member added';
		default: return action.replace(/_/g, ' ');
	}
}

export function RecentActivity({ logs }: { logs: ActivityLog[] }) {
	return (
		<Card className="lg:col-span-2 p-6 h-fit">
			<h3 className="text-lg font-semibold text-(--primary) mb-4">Recent Activity</h3>
			<div className="space-y-0 relative">
				{/* Timeline line */}
				<div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-(--border)"></div>

				{logs.length === 0 ? (
					<p className="pl-8 text-(--secondary) py-2">No recent activity.</p>
				) : (
					logs.map((log) => (
						<div key={log.id} className="relative pl-8 py-3 group">
							<div className="absolute left-0 top-4 w-5 h-5 rounded-full bg-(--surface) border-2 border-(--border) group-hover:border-accent group-hover:scale-110 transition-all z-10"></div>

							<p className="text-sm font-medium text-(--primary)">
								{formatActivityAction(log.action)}
							</p>
							<p className="text-xs text-(--secondary) mt-0.5">
								{new Date(log.createdAt).toLocaleString()}
							</p>
						</div>
					))
				)}
			</div>
		</Card>
	);
}
