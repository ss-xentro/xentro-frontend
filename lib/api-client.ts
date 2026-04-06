/**
 * Shared API client with consistent auth headers, error handling,
 * and response parsing. All frontend API calls should use this.
 */
import { getSessionToken } from '@/lib/auth-utils';
import { getApiErrorMessageFromPayload } from '@/lib/error-utils';

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

export interface RequestOptions extends Omit<RequestInit, 'body'> {
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

// ── GET request deduplication + short-lived response cache ─────
// Deduplicates identical in-flight GET requests AND caches resolved
// responses for a short TTL so rapid re-mounts / navigations don't
// trigger redundant network calls.

const inflightGets = new Map<string, Promise<unknown>>();

interface CachedResponse { data: unknown; expiry: number }
const responseCache = new Map<string, CachedResponse>();

/** Default TTL for cached GET responses (ms). */
const DEFAULT_CACHE_TTL = 5_000; // 5 seconds

/** Endpoints that benefit from a longer cache window. */
const LONG_CACHE_URLS = ['/api/auth/me'];
const LONG_CACHE_TTL = 30_000; // 30 seconds

function getCacheTTL(url: string): number {
	if (LONG_CACHE_URLS.some(prefix => url.startsWith(prefix))) return LONG_CACHE_TTL;
	return DEFAULT_CACHE_TTL;
}

function deduplicatedGet<T>(url: string, fetchFn: () => Promise<T>): Promise<T> {
	// 1. Return cached response if still fresh
	const cached = responseCache.get(url);
	if (cached && Date.now() < cached.expiry) {
		return Promise.resolve(cached.data as T);
	}

	// 2. Deduplicate in-flight requests
	const existing = inflightGets.get(url);
	if (existing) return existing as Promise<T>;

	const promise = fetchFn()
		.then((data) => {
			responseCache.set(url, { data, expiry: Date.now() + getCacheTTL(url) });
			return data;
		})
		.finally(() => {
			inflightGets.delete(url);
		});
	inflightGets.set(url, promise);
	return promise;
}

/** Invalidate cached GET responses (call after mutations). */
export function invalidateCache(urlPrefix?: string) {
	if (!urlPrefix) {
		responseCache.clear();
		return;
	}
	for (const key of responseCache.keys()) {
		if (key.startsWith(urlPrefix)) responseCache.delete(key);
	}
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
		let errMsg = `Request failed with status ${res.status}`;

		if (data) {
			errMsg = getApiErrorMessageFromPayload(data, errMsg);
		} else {
			const textBody = await res.text().catch(() => '');
			if (textBody?.trim()) {
				errMsg = textBody.trim();
			}
		}
		throw new ApiError(errMsg, res.status, data as Record<string, unknown> | null);
	}

	return data as T;
}

// ── Convenience methods ────────────────────────────

export const api = {
	get<T = unknown>(path: string, options?: RequestOptions) {
		const url = buildUrl(path, options?.params);
		return deduplicatedGet<T>(url, () =>
			request<T>(path, { ...options, method: 'GET' })
		);
	},

	post<T = unknown>(path: string, options?: RequestOptions) {
		const result = request<T>(path, { ...options, method: 'POST' });
		result.then(() => invalidateCache()).catch(() => { });
		return result;
	},

	put<T = unknown>(path: string, options?: RequestOptions) {
		const result = request<T>(path, { ...options, method: 'PUT' });
		result.then(() => invalidateCache()).catch(() => { });
		return result;
	},

	patch<T = unknown>(path: string, options?: RequestOptions) {
		const result = request<T>(path, { ...options, method: 'PATCH' });
		result.then(() => invalidateCache()).catch(() => { });
		return result;
	},

	delete<T = unknown>(path: string, options?: RequestOptions) {
		const result = request<T>(path, { ...options, method: 'DELETE' });
		result.then(() => invalidateCache()).catch(() => { });
		return result;
	},
};

export default api;
