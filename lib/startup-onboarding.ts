export interface StartupCompletionPayload {
	name?: string | null;
	tagline?: string | null;
	logo?: string | null;
	founders?: Array<{ name?: string | null; email?: string | null }> | null;
	sectors?: string[] | null;
	stage?: string | null;
	whyXentro?: string[] | null;
}

export function getStartupCompletionStep(payload: StartupCompletionPayload) {
	if (!payload.name?.trim() || !payload.tagline?.trim() || !payload.logo) return 1;
	if (!payload.founders?.[0]?.name?.trim() || !payload.founders?.[0]?.email?.trim()) return 2;
	if (!payload.sectors?.length || !payload.stage) return 3;
	if (!payload.whyXentro?.length) return 4;
	return 5;
}

export function isStartupOnboardingComplete(payload: StartupCompletionPayload) {
	return getStartupCompletionStep(payload) > 4;
}
