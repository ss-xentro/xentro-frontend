'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { toast } from 'sonner';
import { getSessionToken } from '@/lib/auth-utils';
import EventWizardForm from '../../_components/EventWizardForm';
import { buildEventPayload, EMPTY_FORM, EventFormData, EventItem, eventToForm } from '../../_lib/constants';

export default function EditEventPage() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const eventId = params?.id;

	const [loading, setLoading] = useState(true);
	const [initialForm, setInitialForm] = useState<EventFormData | null>(null);

	useEffect(() => {
		if (!eventId) {
			toast.error('Event ID is missing.');
			setLoading(false);
			return;
		}

		const fetchEvent = async () => {
			const token = getSessionToken('institution') || getSessionToken();
			if (!token) {
				toast.error('Authentication required. Please log in again.');
				setLoading(false);
				return;
			}

			setLoading(true);

			try {
				const res = await fetch(`/api/events/${eventId}/`, {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					throw new Error(data.message || data.detail || 'Failed to load event');
				}

				const data = await res.json();
				const event: EventItem | undefined = data?.event || data?.data || data;

				if (!event) {
					throw new Error('Event not found.');
				}

				setInitialForm(eventToForm(event));
			} catch (err) {
				toast.error(err instanceof Error ? err.message : 'Failed to load event');
			} finally {
				setLoading(false);
			}
		};

		fetchEvent();
	}, [eventId]);

	const handleUpdate = async (form: EventFormData) => {
		const token = getSessionToken('institution') || getSessionToken();
		if (!token) {
			throw new Error('Authentication required. Please log in again.');
		}

		const res = await fetch(`/api/events/${eventId}/`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(buildEventPayload(form)),
		});

		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			throw new Error(data.message || data.detail || 'Failed to update event');
		}

		router.push('/institution-dashboard/events');
	};

	return (
		<DashboardSidebar>
			<div className="mx-auto w-full max-w-4xl px-6 py-10 space-y-6">
				<div className="space-y-3">
					<button
						type="button"
						onClick={() => router.push('/institution-dashboard/events')}
						className="text-sm text-gray-400 hover:text-white transition-colors"
					>
						Back to events
					</button>
					<h1 className="text-3xl font-bold text-white">Edit Event</h1>
					<p className="text-sm text-gray-400">Update event details in a guided three-step flow.</p>
				</div>

				{loading ? (
					<div className="space-y-4">
						<div className="h-20 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
						<div className="h-[420px] rounded-xl bg-white/5 border border-white/10 animate-pulse" />
					</div>
				) : initialForm ? (
					<EventWizardForm
						initialForm={initialForm}
						autosaveKey={`institution-event-edit-v2-${eventId}-draft`}
						submitLabel="Save Changes"
						savingLabel="Saving changes..."
						onCancel={() => router.push('/institution-dashboard/events')}
						onSubmit={handleUpdate}
					/>
				) : (
					<EventWizardForm
						initialForm={EMPTY_FORM}
						autosaveKey={`institution-event-edit-v2-${eventId}-draft`}
						submitLabel="Save Changes"
						savingLabel="Saving changes..."
						onCancel={() => router.push('/institution-dashboard/events')}
						onSubmit={handleUpdate}
					/>
				)}
			</div>
		</DashboardSidebar>
	);
}
