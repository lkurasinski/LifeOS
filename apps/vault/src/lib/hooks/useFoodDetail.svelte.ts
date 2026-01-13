/**
 * Food Detail Hook
 *
 * Reusable hook for fetching complete food details by ID from internal database or external sources.
 * Handles loading state, caching, and error handling via TanStack Query.
 *
 * @example
 * let foodId = $state(123);
 * const foodDetail = useFoodDetail(() => ({ foodId, source: 'fdc' }));
 *
 * $effect(() => {
 *   if (foodDetail.data) {
 *     console.log('Food loaded:', foodDetail.data);
 *   }
 * });
 */

import { createQuery } from '@tanstack/svelte-query';
import { API_ROUTES } from '$lib/api/api-routes';
import { fetchJson } from '$lib/api/client';
import type { Food } from '$domains/cookbook/foods';
import type { FoodSourceType } from '$lib/api/api-routes';

interface UseFoodDetailOptions {
	foodId: number | string | null;
	source?: FoodSourceType | 'internal' | 'fdc';
	enabled?: boolean;
}

export function useFoodDetail(getOptions: () => UseFoodDetailOptions) {
	const detailQuery = createQuery(() => {
		const { foodId, source, enabled = true } = getOptions();

		return {
			queryKey: ['foods', 'detail', foodId, source] as const,
			queryFn: () => {
				if (!foodId) {
					throw new Error('Food ID is required');
				}
				return fetchJson<Food>(API_ROUTES.FOODS.DETAILS(foodId, source));
			},
			enabled: enabled && !!foodId,
			staleTime: 5 * 60 * 1000 // 5 minutes - food details don't change often
		};
	});

	return {
		get data() {
			return detailQuery.data;
		},
		get isLoading() {
			return detailQuery.isLoading;
		},
		get isFetching() {
			return detailQuery.isFetching;
		},
		get isError() {
			return detailQuery.isError;
		},
		get error() {
			return detailQuery.error;
		},
		refetch: detailQuery.refetch
	};
}
