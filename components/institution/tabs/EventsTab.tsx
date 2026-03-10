import { Card } from '@/components/ui';
import { Event } from '../institution-tabs-config';

export default function EventsTab({ events }: { events: Event[] }) {
	return (
		<div>
			<h2 className="text-xl font-bold text-(--primary) mb-4">Upcoming Events</h2>
			{events.length > 0 ? (
				<div className="space-y-4">
					{events.map((event) => (
						<Card key={event.id} className="flex gap-4 p-6" hoverable>
							<div className="w-12 h-12 rounded-lg bg-(--warning-light) flex items-center justify-center text-[#B45309] shrink-0 font-bold text-center leading-none">
								<div>
									<span className="block text-xs uppercase">{event.startTime ? new Date(event.startTime).toLocaleString('default', { month: 'short' }) : '--'}</span>
									<span className="block text-xl">{event.startTime ? new Date(event.startTime).getDate() : '--'}</span>
								</div>
							</div>
							<div>
								<h3 className="font-bold text-(--primary) text-lg">{event.name}</h3>
								<p className="text-(--secondary) mt-1 mb-2">{event.description ?? 'No description provided.'}</p>
								<p className="text-sm text-(--secondary) flex items-center gap-1">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									{event.location ?? 'TBC'}
								</p>
							</div>
						</Card>
					))}
				</div>
			) : (
				<p className="text-(--secondary) italic">No upcoming events listed.</p>
			)}
		</div>
	);
}
