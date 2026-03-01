/**
 * Shared API client with consistent auth headers, error handling,
 * and response parsing. All frontend API calls should use this.
 */
import { getSessionToken } from '@/lib/auth-utils';

// ── Types ──────────────────────────────────────────

export class ApiError extends Error {
	status: number;
	data: Record<string, unknown> | null;

	constructor(message: string, status: number, data: Record<string, unknown> | null = null) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.data = data;
	}
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
	/** Override the role hint passed to getSessionToken */
	role?: string;
	/** Skip auth header (for public endpoints) */
	public?: boolean;
	/** JSON body — will be serialized automatically */
	json?: unknown;
	/** Override raw body (multipart, etc.) */
	body?: BodyInit;
	/** Query params appended to the URL */
	params?: Record<string, string | number | boolean | undefined | null>;
}

// ── Helpers ────────────────────────────────────────

function buildUrl(path: string, params?: RequestOptions['params']): string {
	const url = path.startsWith('http') ? path : path;
	if (!params) return url;
	const sp = new URLSearchParams();
	for (const [key, val] of Object.entries(params)) {
		if (val !== undefined && val !== null && val !== '') {
			sp.set(key, String(val));
		}
	}
	const qs = sp.toString();
	return qs ? `${url}?${qs}` : url;
}

// ── Core fetch wrapper ─────────────────────────────

async function request<T = unknown>(
	path: string,
	options: RequestOptions = {}
): Promise<T> {
	const { role, public: isPublic, json, params, body, headers: extraHeaders, ...fetchOpts } = options;

	const headers: Record<string, string> = {};

	// Auth
	if (!isPublic) {
		const token = getSessionToken(role);
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}
	}

	// Content-Type
	if (json !== undefined) {
		headers['Content-Type'] = 'application/json';
	}

	// Merge caller headers
	if (extraHeaders) {
		const h = extraHeaders instanceof Headers
			? Object.fromEntries(extraHeaders.entries())
			: (extraHeaders as Record<string, string>);
		Object.assign(headers, h);
	}

	const url = buildUrl(path, params);

	const res = await fetch(url, {
		...fetchOpts,
		headers,
		body: json !== undefined ? JSON.stringify(json) : body,
	});

	// Try to parse response body
	let data: T | null = null;
	const contentType = res.headers.get('content-type') || '';
	if (contentType.includes('application/json')) {
		try {
			data = await res.json();
		} catch {
			// Non-parseable JSON
		}
	}

	if (!res.ok) {
		const errMsg =
			(data as Record<string, unknown>)?.message as string
			|| (data as Record<string, unknown>)?.error as string
			|| (data as Record<string, unknown>)?.detail as string
			|| `Request failed with status ${res.status}`;
		throw new ApiError(errMsg, res.status, data as Record<string, unknown> | null);
	}

	return data as T;
}

// ── Convenience methods ────────────────────────────

export const api = {
	get<T = unknown>(path: string, options?: RequestOptions) {
		return request<T>(path, { ...options, method: 'GET' });
	},

	post<T = unknown>(path: string, options?: RequestOptions) {
		return request<T>(path, { ...options, method: 'POST' });
	},

	put<T = unknown>(path: string, options?: RequestOptions) {
		return request<T>(path, { ...options, method: 'PUT' });
	},

	patch<T = unknown>(path: string, options?: RequestOptions) {
		return request<T>(path, { ...options, method: 'PATCH' });
	},

	delete<T = unknown>(path: string, options?: RequestOptions) {
		return request<T>(path, { ...options, method: 'DELETE' });
	},
};

export default api;
