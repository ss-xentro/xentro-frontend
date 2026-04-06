import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';
import { Booking, BOOKING_STATUS_BADGE } from '../_lib/constants';

function fmt12(t: string): string {
	const [hStr, mStr] = t.split(':');
	let h = parseInt(hStr, 10);
	const m = mStr || '00';
	const ampm = h >= 12 ? 'PM' : 'AM';
	if (h > 12) h -= 12;
	if (h === 0) h = 12;
	return `${h}:${m} ${ampm}`;
}

const STATUS_ICONS: Record<string, string> = {
	pending: 'clock',
	confirmed: 'check-circle-2',
	cancelled: 'x-circle',
	completed: 'award',
};

interface BookingsListProps {
	bookings: Booking[];
	cancellingId: string | null;
	onCancel: (bookingId: string) => void;
}

export default function BookingsList({ bookings, cancellingId, onCancel }: BookingsListProps) {
	if (bookings.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="w-14 h-14 rounded-full bg-(--accent-subtle) flex items-center justify-center mb-3">
					<AppIcon name="calendar" className="w-7 h-7 text-(--secondary) opacity-40" />
				</div>
				<h3 className="text-base font-semibold text-(--primary) mb-1">No sessions booked</h3>
				<p className="text-sm text-(--secondary) mb-4 max-w-sm">
					Browse mentors and book a session from their profile page.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{bookings.map((booking) => {
				const badge = BOOKING_STATUS_BADGE[booking.status] || BOOKING_STATUS_BADGE.pending;
				const statusIcon = STATUS_ICONS[booking.status] || 'clock';
				const sched = new Date(booking.scheduledDate);
				const isPast = sched < new Date() && booking.status === 'confirmed';

				return (
					<div
						key={booking.id}
						className={cn(
							'flex bg-(--surface) border border-(--border) rounded-xl overflow-hidden hover:border-(--secondary-light) transition-colors',
							isPast && 'ring-1 ring-amber-500/20',
						)}
					>
						{/* Date sidebar */}
						<div className="w-20 shrink-0 flex flex-col items-center justify-center py-4 bg-(--accent-subtle) border-r border-(--border)">
							<span className="text-xs font-medium text-(--secondary) uppercase">
								{sched.toLocaleDateString('en-US', { month: 'short' })}
							</span>
							<span className="text-2xl font-bold text-(--primary) leading-tight">
								{sched.getDate()}
							</span>
							<span className="text-[10px] text-(--secondary-light)">
								{sched.toLocaleDateString('en-US', { weekday: 'short' })}
							</span>
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0 p-4">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 space-y-1">
									<p className="text-sm font-semibold text-(--primary) truncate">
										{booking.mentor_user ? (
											<Link
												href={`/explore/mentors/${booking.mentor_user}`}
												className="hover:underline underline-offset-2"
											>
												Session with {booking.mentorName || 'Mentor'}
											</Link>
										) : (
											<>Session with {booking.mentorName || 'Mentor'}</>
										)}
									</p>
									{booking.slotStart && booking.slotEnd && (
										<p className="text-xs text-(--secondary) flex items-center gap-1.5">
											<AppIcon name="clock" className="w-3 h-3" />
											{fmt12(booking.slotStart)} – {fmt12(booking.slotEnd)}
										</p>
									)}
								</div>

								<span className={cn(
									'shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border',
									badge.bg, badge.text,
								)}>
									<AppIcon name={statusIcon} className="w-3 h-3" />
									{badge.label}
								</span>
							</div>

							{booking.notes && (
								<p className="text-xs text-(--secondary) mt-2 py-2 px-3 rounded-lg bg-(--accent-subtle) border border-(--border) italic line-clamp-2">
									&ldquo;{booking.notes}&rdquo;
								</p>
							)}

							<div className="flex items-center gap-2 mt-3">
								{(booking.status === 'pending' || booking.status === 'confirmed') && (
									<button
										onClick={() => onCancel(booking.id)}
										disabled={cancellingId === booking.id}
										className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
									>
										<AppIcon name="x" className="w-3 h-3" />
										{cancellingId === booking.id ? 'Cancelling…' : 'Cancel Session'}
									</button>
								)}
								{isPast && (
									<span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
										Past due
									</span>
								)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
