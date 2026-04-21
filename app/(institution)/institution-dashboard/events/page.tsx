'use client';

import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button, Badge } from '@/components/ui';
import { useApiQuery, useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { EventItem } from './_lib/constants';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
	published: 'bg-green-500/20 text-green-600 dark:text-green-200',
	draft: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-200',
	cancelled: 'bg-red-500/20 text-red-600 dark:text-red-200',
};

function formatDate(dateStr: string | null) {
	if (!dateStr) return '—';
	return new Date(dateStr).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

export default function InstitutionEventsPage() {
	const router = useRouter();

	const { data: rawData, isLoading: loading } = useApiQuery<{ events: EventItem[]; data: EventItem[] }>(
		queryKeys.institution.events(),
		'/api/events/',
		{ requestOptions: { role: 'institution' } },
	);
	const events: EventItem[] = rawData?.events ?? rawData?.data ?? [];

	const deleteMutation = useApiMutation<unknown, { _id: string }>({
		method: 'delete',
		path: (v) => `/api/events/${v._id}`,
		invalidateKeys: [queryKeys.institution.events()],
		requestOptions: { role: 'institution' },
		mutationOptions: {
			onError: (err) => toast.error(err.message),
		},
	});
	const deletingId = deleteMutation.isPending ? deleteMutation.variables?._id ?? null : null;

	const handleDelete = (id: string) => {
		if (!confirm('Are you sure you want to delete this event?')) return;
		deleteMutation.mutate({ _id: id });
	};

	if (loading) {
		return (
			<DashboardSidebar>
				<div className="p-8 space-y-4">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="h-24 rounded-xl bg-(--accent-subtle) animate-pulse" />
					))}
				</div>
			</DashboardSidebar>
		);
	}

	return (
		<DashboardSidebar>
			<div className="p-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-(--primary)">Events</h1>
						<p className="text-(--secondary) mt-1">Manage your institution events</p>
					</div>
					<Button onClick={() => router.push('/institution-dashboard/add-event')}>
						+ Add Event
					</Button>
				</div>

				{events.length === 0 ? (
					<Card className="p-12 text-center">
						<p className="text-2xl mb-2">🗓️</p>
						<p className="text-(--primary) font-semibold text-lg">No events yet</p>
						<p className="text-(--secondary) mt-1 mb-4">
							Create your first event to get started.
						</p>
						<Button onClick={() => router.push('/institution-dashboard/add-event')}>
							Add Event
						</Button>
					</Card>
				) : (
					<div className="space-y-4">
						{events.map((event) => (
							<Card
								key={event.id}
								className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-(--accent-subtle) transition-colors"
								onClick={() => router.push(`/institution-dashboard/events/${event.id}`)}
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="font-semibold text-(--primary) truncate">
											{event.name}
										</span>
										{event.status && (
											<Badge className={statusColors[event.status] ?? ''}>
												{event.status}
											</Badge>
										)}
										{event.type && (
											<Badge className="bg-(--accent-subtle) text-(--primary-light)">
												{event.type.replace(/[-_]/g, ' ')}
											</Badge>
										)}
									</div>
									<p className="text-(--secondary) text-sm mt-1 truncate">
										{formatDate(event.startTime)}
										{event.endTime ? ` → ${formatDate(event.endTime)}` : ''}
										{event.location ? ` · ${event.location}` : event.isVirtual ? ' · Online' : ''}
									</p>
									<p className="text-(--secondary) text-sm">
										{event.attendeeCount} attendee{event.attendeeCount !== 1 ? 's' : ''}
										{event.maxAttendees ? ` / ${event.maxAttendees} max` : ''}
									</p>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									<Button
										size="sm"
										variant="secondary"
										onClick={(e) => {
											e.stopPropagation();
											router.push(`/institution-dashboard/events/${event.id}`);
										}}
									>
										View
									</Button>
									<Button
										size="sm"
										variant="danger"
										disabled={deletingId === event.id}
										onClick={(e) => {
											e.stopPropagation();
											handleDelete(event.id);
										}}
									>
										{deletingId === event.id ? 'Deleting…' : 'Delete'}
									</Button>
								</div>
							</Card>
						))}
					</div>
				)}
			</div>
		</DashboardSidebar>
	);
}

