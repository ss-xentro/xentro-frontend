'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import EventWizardForm from '../events/_components/EventWizardForm';
import { EMPTY_FORM, buildEventPayload, EventFormData } from '../events/_lib/constants';
import { queryKeys } from '@/lib/queries/keys';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';

export default function AddEventPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (form: EventFormData) => {
		setSaving(true);
		try {
			await api.post('/api/events/', {
				role: 'institution',
				json: buildEventPayload(form),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.institution.events() });
			toast.success('Event created successfully!');
			router.push('/institution-dashboard/events');
		} catch (err) {
			toast.error((err as Error).message || 'Failed to create event');
		} finally {
			setSaving(false);
		}
	};

	return (
		<DashboardSidebar>
			<div className="p-8 max-w-3xl mx-auto">
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-(--primary)">Add Event</h1>
					<p className="text-(--secondary) mt-1">Create a new event for your institution</p>
				</div>
				<EventWizardForm
					initialForm={EMPTY_FORM}
					autosaveKey="add-event-draft"
					submitLabel="Create Event"
					savingLabel="Creating…"
					onCancel={() => router.push('/institution-dashboard/events')}
					onSubmit={handleSubmit}
				/>
			</div>
		</DashboardSidebar>
	);
}

