import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { EventItem, formatDate } from '../_lib/constants';

interface EventCardProps {
	event: EventItem;
	onEdit: (event: EventItem) => void;
	onDelete: (id: string) => void;
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
	return (
		<Card className="p-5 space-y-3 hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-(--primary) truncate">{event.name}</h3>
					{event.type && (
						<span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent">
							{event.type}
						</span>
					)}
				</div>
				<span className={cn(
					'px-2 py-0.5 text-xs rounded-full font-medium',
					event.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
				)}>
					{event.approved ? 'Approved' : 'Pending'}
				</span>
			</div>

			{event.description && (
				<p className="text-sm text-(--secondary) line-clamp-2">{event.description}</p>
			)}

			<div className="grid grid-cols-2 gap-2 text-xs text-(--secondary)">
				<div><span className="font-medium">Start:</span> {formatDate(event.startTime)}</div>
				<div><span className="font-medium">End:</span> {formatDate(event.endTime)}</div>
				<div><span className="font-medium">Location:</span> {event.location || (event.isVirtual ? 'Virtual' : '—')}</div>
				<div><span className="font-medium">Attendees:</span> {event.attendeeCount}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''}</div>
			</div>

			<div className="flex items-center gap-2 pt-1 border-t border-(--border)">
				<button onClick={() => onEdit(event)} className="text-xs text-accent hover:underline">Edit</button>
				<button onClick={() => onDelete(event.id)} className="text-xs text-red-500 hover:underline">Delete</button>
			</div>
		</Card>
	);
}
