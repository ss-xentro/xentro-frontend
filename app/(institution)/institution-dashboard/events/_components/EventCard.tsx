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
		<Card className="p-5 space-y-3 bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
			{event.coverImage && (
				<div className="relative -mx-5 -mt-5 h-36 overflow-hidden rounded-t-xl border-b border-white/10">
					<img src={event.coverImage} alt="" className="w-full h-full object-cover" />
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
					<div className="absolute inset-x-0 bottom-0 p-3">
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-white truncate">{event.name}</h3>
								{event.type && (
									<span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-violet-500/30 text-violet-100 border border-violet-300/30">
										{event.type}
									</span>
								)}
							</div>
							<span className={cn(
								'px-2 py-0.5 text-xs rounded-full font-medium border',
								event.approved
									? 'bg-green-500/25 text-green-100 border-green-300/35'
									: 'bg-yellow-500/25 text-yellow-100 border-yellow-300/35'
							)}>
								{event.approved ? 'Approved' : 'Pending'}
							</span>
						</div>
					</div>
				</div>
			)}

			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					{!event.coverImage && <h3 className="font-semibold text-white truncate">{event.name}</h3>}
					{!event.coverImage && event.type && (
						<span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-violet-500/20 text-violet-300">
							{event.type}
						</span>
					)}
				</div>
				{!event.coverImage && (
					<span className={cn(
						'px-2 py-0.5 text-xs rounded-full font-medium',
						event.approved ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
					)}>
						{event.approved ? 'Approved' : 'Pending'}
					</span>
				)}
			</div>

			{event.description && (
				<p className="text-sm text-gray-400 line-clamp-2">{event.description}</p>
			)}

			<div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
				<div><span className="font-medium">Start:</span> {formatDate(event.startTime)}</div>
				<div><span className="font-medium">End:</span> {formatDate(event.endTime)}</div>
				<div><span className="font-medium">Location:</span> {event.location || (event.isVirtual ? 'Virtual' : '—')}</div>
				<div><span className="font-medium">Slots:</span> {event.attendeeCount} booked{event.maxAttendees ? ` / ${event.maxAttendees}` : ' / unlimited'}</div>
			</div>

			<div className="flex items-center gap-2 pt-1 border-t border-white/10">
				<button onClick={() => onEdit(event)} className="text-xs text-violet-300 hover:underline">Edit</button>
				<button onClick={() => onDelete(event.id)} className="text-xs text-red-400 hover:underline">Delete</button>
			</div>
		</Card>
	);
}
