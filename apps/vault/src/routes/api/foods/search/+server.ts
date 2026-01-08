import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStrategy } from '$domains/cookbook/foods/server/services/food-sources';
import { type FoodSearchParams } from '$domains/cookbook/foods';
import { z } from 'zod';
import { dataSourceProviders } from '$lib';

export const GET: RequestHandler = async ({ url }): Promise<Response> => {
	const query = url.searchParams.get('q') ?? '*';
	const source = url.searchParams.get('source') || 'internal';

	if (!query) {
		return json({ error: 'Query parameter "q" is required' }, { status: 400 });
	}

	try {
		const strategy = getStrategy(source);

		const searchParams: FoodSearchParams = {
			query,
			pageSize: Number(url.searchParams.get('pageSize') ?? '25'),
			pageNumber: Number(url.searchParams.get('pageNumber') ?? url.searchParams.get('page') ?? '1'),
			category: url.searchParams.get('category') || undefined,
			source: url.searchParams.get('source') || 'custom',
			sortBy: url.searchParams.get('sortBy') || 'name',
			sortOrder: url.searchParams.get('sortOrder') || 'asc'
		};

		url.searchParams.forEach((value, key) => {
			if (!['q', 'source', 'pageSize', 'pageNumber', 'per_page', 'page'].includes(key)) {
				// Handle comma-separated values
				if (value.includes(',')) {
					searchParams[key] = value.split(',');
				} else {
					searchParams[key] = value;
				}
			}
		});

		// Execute search using the strategy
		const results = await strategy.search(searchParams);

		// Return domain models
		return json(results);
	} catch (error) {
		console.error('Food search error:', error);
		const message = error instanceof Error ? error.message : 'Failed to search food source';
		return json({ error: message }, { status: 500 });
	}
};
