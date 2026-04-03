import { AppIcon } from '@/components/ui/AppIcon';
import { Booking, BOOKING_STATUS_BADGE } from '../_lib/constants';

interface BookingsListProps {
	bookings: Booking[];
	cancellingId: string | null;
	onCancel: (bookingId: string) => void;
}

export default function BookingsList({ bookings, cancellingId, onCancel }: BookingsListProps) {
	if (bookings.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="w-14 h-14 rounded-full bg-(--surface) flex items-center justify-center mb-3">
					<AppIcon name="calendar" className="w-7 h-7 text-(--secondary)" />
				</div>
				<h3 className="text-base font-semibold text-(--primary) mb-1">No sessions booked</h3>
				<p className="text-sm text-(--secondary) mb-4">Once you connect with a mentor you can book sessions from their profile.</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{bookings.map((booking) => {
				const badge = BOOKING_STATUS_BADGE[booking.status] || BOOKING_STATUS_BADGE.pending;
				const sched = new Date(booking.scheduledDate);
				return (
					<div key={booking.id} className="flex items-start gap-4 p-4 bg-(--surface) border border-(--border) rounded-xl hover:border-(--secondary-light) transition-colors">
						<div className="w-14 h-14 rounded-xl bg-(--surface-hover) flex flex-col items-center justify-center shrink-0">
							<span className="text-xs font-medium text-(--primary)">{sched.toLocaleDateString('en-US', { month: 'short' })}</span>
							<span className="text-lg font-bold text-(--primary) leading-tight">{sched.getDate()}</span>
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between gap-3">
								<div className="min-w-0">
									<p className="text-sm font-semibold text-(--primary) truncate">Session with {booking.mentorName || 'Mentor'}</p>
									<p className="text-xs text-(--secondary)">
										{sched.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
										{booking.slotStart && booking.slotEnd && <> · {booking.slotStart} - {booking.slotEnd}</>}
									</p>
								</div>
								<span className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>
							</div>
							{booking.notes && <p className="text-xs text-(--secondary) mt-1.5 line-clamp-1">{booking.notes}</p>}
							{(booking.status === 'pending' || booking.status === 'confirmed') && (
								<div className="mt-2.5">
									<button
										onClick={() => onCancel(booking.id)}
										disabled={cancellingId === booking.id}
										className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/150/10 transition-colors disabled:opacity-50"
									>
										{cancellingId === booking.id ? 'Cancelling...' : 'Cancel Session'}
									</button>
								</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
