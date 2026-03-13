export interface MentorCompletionPayload {
	occupation?: unknown;
	expertise?: unknown;
	onboarding_completed?: unknown;
	onboardingCompleted?: unknown;
}

function hasMeaningfulExpertise(value: unknown): boolean {
	if (Array.isArray(value)) {
		return value.some((item) => String(item).trim().length > 0);
	}

	if (typeof value === 'string') {
		return value.trim().length > 0;
	}

	return Boolean(value);
}

export function isMentorOnboardingComplete(payload: MentorCompletionPayload): boolean {
	if (typeof payload.onboardingCompleted === 'boolean') {
		return payload.onboardingCompleted;
	}

	if (typeof payload.onboarding_completed === 'boolean') {
		return payload.onboarding_completed;
	}

	const hasOccupation = typeof payload.occupation === 'string'
		? payload.occupation.trim().length > 0
		: Boolean(payload.occupation);

	return hasOccupation && hasMeaningfulExpertise(payload.expertise);
}
