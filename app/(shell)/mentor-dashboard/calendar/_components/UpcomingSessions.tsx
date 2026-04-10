'use client';

import { Card } from '@/components/ui';
import { STATUS_COLORS, type Booking } from '../_lib/constants';

interface UpcomingSessionsProps {
	bookings: Booking[];
	onAction: (bookingId: string, action: 'confirmed' | 'cancelled') => void;
}

export default function UpcomingSessions({ bookings, onAction }: UpcomingSessionsProps) {
	const upcoming = bookings
		.filter(b => b.status !== 'cancelled' && b.status !== 'completed')
		.sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

	return (
		<Card className="p-5">
			<h2 className="text-lg font-semibold text-(--primary) mb-4">Upcoming Sessions</h2>
			{upcoming.length === 0 ? (
				<p className="text-sm text-(--secondary)">No upcoming sessions</p>
			) : (
				<div className="space-y-3">
					{upcoming.map(b => {
						const date = new Date(b.scheduled_date);
						return (
							<div key={b.id} className="flex items-center justify-between p-3 bg-(--surface-hover) rounded-lg">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm">
										{(b.mentee_user?.name || '?').charAt(0).toUpperCase()}
									</div>
									<div>
										<div className="text-sm font-medium text-(--primary)">{b.mentee_user?.name || 'Unknown'}</div>
										<div className="text-xs text-(--secondary)">
											{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
											{' at '}
											{date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
										</div>
										{b.notes && <div className="text-xs text-(--secondary) mt-0.5 italic">{b.notes}</div>}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[b.status] || ''}`}>
										{b.status}
									</span>
									{b.status === 'pending' && (
										<div className="flex gap-1">
											<button
												onClick={() => onAction(b.id, 'confirmed')}
												className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-200 rounded hover:bg-emerald-200 transition-colors"
											>
												Accept
											</button>
											<button
												onClick={() => onAction(b.id, 'cancelled')}
												className="text-xs px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-200 rounded hover:bg-red-200 transition-colors"
											>
												Decline
											</button>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</Card>
	);
}
