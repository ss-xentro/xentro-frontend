/**
 * Generic TanStack Query wrappers around the existing `api` client.
 *
 * useApiQuery  — replaces `useEffect + fetch + useState(loading/data/error)`
 * useApiMutation — wraps POST/PUT/PATCH/DELETE and auto-invalidates queries
 */
import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions,
	type UseMutationOptions,
	type QueryKey,
} from '@tanstack/react-query';
import api, { ApiError, type RequestOptions } from '@/lib/api-client';

// ── Query Hook ─────────────────────────────────────

type ApiQueryOptions<T> = Omit<
	UseQueryOptions<T, ApiError>,
	'queryKey' | 'queryFn'
> & {
	/** Extra RequestOptions forwarded to `api.get` */
	requestOptions?: RequestOptions;
};

/**
 * Declarative data fetching.  Drop-in replacement for the
 * `useEffect(() => fetch(url), [])` pattern every page uses today.
 *
 * @example
 *   const { data, isLoading, error } = useApiQuery<Startup>(
 *     ['startup', id],
 *     `/api/founder/my-startup`,
 *   );
 */
export function useApiQuery<T = unknown>(
	queryKey: QueryKey,
	path: string,
	options?: ApiQueryOptions<T>,
) {
	const { requestOptions, ...queryOptions } = options ?? {};

	return useQuery<T, ApiError>({
		queryKey,
		queryFn: () => api.get<T>(path, requestOptions),
		...queryOptions,
	});
}

// ── Mutation Hook ──────────────────────────────────

type MutationMethod = 'post' | 'put' | 'patch' | 'delete';

interface ApiMutationConfig<TData, TVariables> {
	/** HTTP method (default: 'post') */
	method?: MutationMethod;
	/** API path — can be a string or a function that receives the variables */
	path: string | ((variables: TVariables) => string);
	/** Query keys to invalidate on success */
	invalidateKeys?: QueryKey[];
	/** Extra RequestOptions merged into every request */
	requestOptions?: Omit<RequestOptions, 'json'>;
	/** Standard TanStack mutation options (onSuccess, onError, etc.) */
	mutationOptions?: Omit<
		UseMutationOptions<TData, ApiError, TVariables>,
		'mutationFn'
	>;
}

/**
 * Wraps api.post / put / patch / delete and automatically invalidates
 * the specified query keys on success, so lists & detail views refresh.
 *
 * @example
 *   const save = useApiMutation<Startup, Partial<Startup>>({
 *     method: 'patch',
 *     path: `/api/founder/my-startup`,
 *     invalidateKeys: [['startup']],
 *   });
 *   save.mutate(formData);
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
	config: ApiMutationConfig<TData, TVariables>,
) {
	const queryClient = useQueryClient();
	const {
		method = 'post',
		path,
		invalidateKeys,
		requestOptions,
		mutationOptions,
	} = config;

	return useMutation<TData, ApiError, TVariables>({
		mutationFn: (variables) => {
			const resolvedPath = typeof path === 'function' ? path(variables) : path;
			return api[method]<TData>(resolvedPath, {
				...requestOptions,
				json: method !== 'delete' ? variables : undefined,
			});
		},
		onSuccess: (...args) => {
			// Auto-invalidate related queries so UI refreshes
			if (invalidateKeys?.length) {
				for (const key of invalidateKeys) {
					queryClient.invalidateQueries({ queryKey: key });
				}
			}
			mutationOptions?.onSuccess?.(...args);
		},
		...mutationOptions,
		// keep our onSuccess wrapper — spread the rest
	});
}
