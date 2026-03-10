export interface StartupCompletionPayload {
	name?: string | null;
	tagline?: string | null;
	logo?: string | null;
	sectors?: string[] | null;
	stage?: string | null;
	whyXentro?: string[] | null;
}

export function getStartupCompletionStep(payload: StartupCompletionPayload) {
	if (!payload.name?.trim() || !payload.tagline?.trim() || !payload.logo) return 1;
	if (!payload.sectors?.length || !payload.stage) return 2;
	if (!payload.whyXentro?.length) return 3;
	return 4;
}

export function isStartupOnboardingComplete(payload: StartupCompletionPayload) {
	return getStartupCompletionStep(payload) > 3;
}
