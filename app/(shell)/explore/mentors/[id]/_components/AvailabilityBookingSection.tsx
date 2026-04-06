'use client';

import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';
import { Section, ORDERED_DAYS, DAY_LABELS, FULL_DAY, formatTime, formatTimeSlot } from './MentorProfileHelpers';

interface MentorSlot {
	id: string;
	dayOfWeek: string;
	startTime: string;
	endTime: string;
	isActive: boolean;
}

interface AvailabilityBookingSectionProps {
	mentorId: string;
	mentorName: string;
	connectionStatus: string | null;
	slots: MentorSlot[];
	slotsLoading: boolean;
	availability?: Record<string, string[]> | null;
	onSlotClick?: (slot: MentorSlot) => void;
}

export default function AvailabilityBookingSection({
	mentorId,
	mentorName,
	connectionStatus,
	slots,
	slotsLoading,
	availability,
	onSlotClick,
}: AvailabilityBookingSectionProps) {
	const isConnected = connectionStatus === 'accepted';

	return (
		<div id="availability-booking">
			<Section
				title="Availability & Booking"
				icon={<AppIcon name="calendar-clock" className="w-4 h-4 text-emerald-400" />}
			>
				{/* Real slots from API (shown when connected) */}
				{isConnected && (
					<>
						{slotsLoading ? (
							<div className="space-y-3">
								{[1, 2, 3].map((i) => (
									<div key={i} className="h-20 bg-(--accent-subtle) border border-(--border) rounded-lg animate-pulse" />
								))}
							</div>
						) : slots.length === 0 ? (
							<div className="flex flex-col items-center py-8 gap-2">
								<AppIcon name="calendar-x" className="w-8 h-8 text-(--secondary-light) opacity-40" />
								<p className="text-sm text-(--secondary-light) text-center">
									This mentor hasn&apos;t set up any bookable slots yet.
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{ORDERED_DAYS.map((day) => {
									const daySlots = slots.filter((s) => s.dayOfWeek.toLowerCase() === day);
									if (daySlots.length === 0) return null;
									return (
										<div key={day} className="bg-(--accent-subtle) border border-(--border) rounded-lg p-4">
											<div className="flex items-center justify-between mb-3">
												<div>
													<p className="text-sm font-semibold text-(--primary)">{DAY_LABELS[day] || day}</p>
													<p className="text-xs text-(--secondary-light)">{FULL_DAY[day] || day}</p>
												</div>
												<AppIcon name="calendar" className="w-4 h-4 text-(--secondary-light)" />
											</div>
											<div className="flex flex-wrap gap-2">
												{daySlots.map((slot) => (
													<button
														key={slot.id}
														onClick={() => onSlotClick?.(slot)}
														className={cn(
															'text-xs px-3.5 py-2 rounded-xl border transition-all font-medium',
															'border-(--border) text-(--foreground) hover:border-(--brand)/40 hover:bg-(--brand)/5 hover:text-brand',
														)}
													>
														{formatTime(slot.startTime)} – {formatTime(slot.endTime)}
													</button>
												))}
											</div>
										</div>
									);
								})}
								{onSlotClick && (
									<p className="text-xs text-(--secondary-light) text-center pt-1">
										Click a time slot to book a session
									</p>
								)}
							</div>
						)}
					</>
				)}

				{/* Static availability display (not connected yet) */}
				{!isConnected && availability && Object.keys(availability).length > 0 && (
					<div className="space-y-3">
						{ORDERED_DAYS.map((day) => {
							const avSlots = availability[day];
							if (!avSlots || avSlots.length === 0) return null;
							return (
								<div key={day} className="bg-(--accent-subtle) border border-(--border) rounded-lg p-4">
									<div className="flex items-center justify-between mb-2">
										<div>
											<p className="text-sm font-semibold text-(--primary)">{DAY_LABELS[day] || day}</p>
											<p className="text-xs text-(--secondary-light)">{FULL_DAY[day] || day}</p>
										</div>
										<AppIcon name="calendar" className="w-4 h-4 text-(--secondary-light)" />
									</div>
									<div className="flex flex-wrap gap-2">
										{avSlots.map((slot, i) => (
											<span key={i} className="text-xs px-3 py-1.5 rounded-lg border border-(--border) text-(--secondary)">{formatTimeSlot(slot)}</span>
										))}
									</div>
								</div>
							);
						})}
						{!connectionStatus && (
							<p className="text-xs text-(--secondary-light) text-center pt-1">Connect with this mentor to book a session</p>
						)}
					</div>
				)}

				{/* No availability at all */}
				{!isConnected && (!availability || Object.keys(availability).length === 0) && (
					<div className="flex flex-col items-center py-6 gap-2">
						<AppIcon name="clock" className="w-6 h-6 text-(--secondary-light) opacity-40" />
						<p className="text-sm text-(--secondary-light) text-center">Availability not set yet.</p>
					</div>
				)}
			</Section>
		</div>
	);
}
