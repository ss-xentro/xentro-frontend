'use client';

import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { getSessionToken } from '@/lib/auth-utils';
import { buildEventPayload, EMPTY_FORM, EventFormData } from '../events/_lib/constants';
import EventWizardForm from '../events/_components/EventWizardForm';

export default function AddEventPage() {
  const router = useRouter();
  const initialForm: EventFormData = {
    ...EMPTY_FORM,
    speakerLineupJson: '',
    agendaTimelineJson: '',
    ticketTypesJson: '',
  };

  const handleCreate = async (form: EventFormData) => {
    const token = getSessionToken('institution') || getSessionToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const res = await fetch('/api/events/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(buildEventPayload(form)),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || data.detail || 'Failed to create event');
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
            className="text-sm text-(--secondary) hover:text-(--primary) transition-colors"
          >
            Back to events
          </button>
          <h1 className="text-3xl font-bold text-(--primary)">Create Event</h1>
          <p className="text-sm text-(--secondary)">Set up your event in three clear steps.</p>
        </div>

        <EventWizardForm
          initialForm={initialForm}
          autosaveKey="institution-event-create-v2-draft"
          submitLabel="Create Event"
          savingLabel="Creating event..."
          onCancel={() => router.push('/institution-dashboard/events')}
          onSubmit={handleCreate}
        />
      </div>
    </DashboardSidebar>
  );
}
