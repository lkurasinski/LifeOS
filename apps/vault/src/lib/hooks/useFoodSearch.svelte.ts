/**
 * Food Search Composable Hook
 *
 * Reusable hook for searching foods from internal database or external sources.
 * Handles query state, debouncing, and caching via TanStack Query.
 *
 * @example
 * let source = $state('fdc');
 * const search = useFoodSearch(() => ({ source, pageSize: 25 }));
 * // Two-way binding works:
 * <Input bind:value={search.query} />
 */

import { createQuery } from '@tanstack/svelte-query';
import { buildSearchUrl, API_ROUTES } from '$frontend/common/api/api-routes';
import { fetchJson } from '$frontend/common/api/client';
import type { FoodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';
import type { FoodDto } from '$contracts/cookbook/food/Food.dto';
import { ANIMATION, SEARCH_CONFIG } from '$frontend/common/constants/ui';

interface UseFoodSearchOptions {
	provider?: FoodSourceProviders;
	dataType?: string;
	apiVersion?: string;
	page?: number;
	minChars?: number;
	autoSearch?: boolean;
	loadingDelay?: number;
	exclude?: number[];
}

export function useFoodSearch(getOptions: () => UseFoodSearchOptions = () => ({})) {
	let query = $state('');
	let debouncedLoading = $state(false);
	let loadingTimer: ReturnType<typeof setTimeout> | null = null;

	const searchQuery = createQuery(() => {
		const {
			provider = 'home-baked',
			dataType = undefined,
			apiVersion = undefined,
			page = SEARCH_CONFIG.DEFAULT_PAGE_SIZE,
			minChars = SEARCH_CONFIG.MIN_QUERY_LENGTH,
			autoSearch = true,
			loadingDelay = ANIMATION.DURATION.NORMAL,
			exclude = undefined
		} = getOptions();

		return {
			queryKey: ['foods', 'search', provider, query, page, apiVersion, exclude] as const,
			queryFn: () =>
				fetchJson<{ items: FoodDto[] }>(
					buildSearchUrl(API_ROUTES.FOODS.SEARCH, {
						provider,
						dataType,
						apiVersion,
						text: query,
						page: page,
						exclude: exclude?.join(',')
					})
				),
			enabled: autoSearch && query.length >= minChars,
			placeholderData: (previousData: { items: FoodDto[] } | undefined) => previousData
		};
	});

	// Watch for fetching state changes and debounce loading indicator
	$effect(() => {
		const { minChars = SEARCH_CONFIG.MIN_QUERY_LENGTH, loadingDelay = ANIMATION.DURATION.NORMAL } =
			getOptions();
		const isActuallyFetching = searchQuery.isFetching && query.length >= minChars;

		if (isActuallyFetching) {
			// Start timer to show loading after delay
			loadingTimer = setTimeout(() => {
				debouncedLoading = true;
			}, loadingDelay);
		} else {
			// Clear timer and hide loading immediately when done
			if (loadingTimer) {
				clearTimeout(loadingTimer);
				loadingTimer = null;
			}
			debouncedLoading = false;
		}

		// Cleanup on unmount
		return () => {
			if (loadingTimer) {
				clearTimeout(loadingTimer);
			}
		};
	});

	return {
		get query() {
			return query;
		},
		set query(value: string) {
			query = value;
		},
		setQuery: (value: string) => {
			query = value;
		},
		clearQuery: () => {
			query = '';
		},
		get results() {
			return searchQuery.data?.items ?? [];
		},
		get isLoading() {
			return debouncedLoading;
		},
		get isError() {
			return searchQuery.isError;
		},
		get error() {
			return searchQuery.error;
		},
		refetch: searchQuery.refetch
	};
}
