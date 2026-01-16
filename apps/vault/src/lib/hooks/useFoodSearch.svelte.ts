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
import { buildSearchUrl, API_ROUTES } from '$lib/api/api-routes';
import { fetchJson } from '$lib/api/client';
import { SEARCH_CONFIG, ANIMATION } from '$lib/constants/ui';
import type { Food } from '$domains/cookbook/foods';

interface UseFoodSearchOptions {
	source?: 'internal' | 'fdc' | 'openfoodfacts';
	dataType?: string;
	apiVersion?: string;
	pageSize?: number;
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
			source = 'internal',
			dataType = undefined,
			apiVersion = undefined,
			pageSize = SEARCH_CONFIG.DEFAULT_PAGE_SIZE,
			minChars = SEARCH_CONFIG.MIN_QUERY_LENGTH,
			autoSearch = true,
			loadingDelay = ANIMATION.DURATION.NORMAL,
			exclude = undefined
		} = getOptions();

		return {
			queryKey: ['foods', 'search', source, query, pageSize, apiVersion, exclude] as const,
			queryFn: () =>
				fetchJson<{ items: Food[] }>(
					buildSearchUrl(API_ROUTES.FOODS.SEARCH, {
						source: source !== 'internal' ? source : undefined,
						dataType,
						apiVersion,
						q: query,
						pageSize,
						exclude: exclude?.join(',')
					})
				),
			enabled: autoSearch && query.length >= minChars,
			placeholderData: (previousData: { items: Food[] } | undefined) => previousData
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
