export async function readApiErrorMessage(res: Response, fallback: string): Promise<string> {
	const contentType = res.headers.get('content-type') || '';

	if (contentType.includes('application/json')) {
		const payload = await res.json().catch(() => ({} as Record<string, unknown>));
		const candidate =
			(payload as Record<string, unknown>).error
			|| (payload as Record<string, unknown>).message
			|| (payload as Record<string, unknown>).detail
			|| flattenErrorObject(payload);

		return candidate ? String(candidate) : fallback;
	}

	const rawText = await res.text().catch(() => '');
	return rawText?.trim() || fallback;
}

function flattenErrorObject(payload: unknown): string {
	if (!payload || typeof payload !== 'object') return '';

	return Object.entries(payload as Record<string, unknown>)
		.filter(([, value]) => Array.isArray(value) || typeof value === 'string')
		.map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
		.join(' | ');
}
