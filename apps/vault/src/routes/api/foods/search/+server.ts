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

		const sourceParam = url.searchParams.get('source');
		const sortByParam = url.searchParams.get('sortBy');
		const sortOrderParam = url.searchParams.get('sortOrder');

		const searchParams: FoodSearchParams = {
			query,
			pageSize: Number(url.searchParams.get('pageSize') ?? '25'),
			pageNumber: Number(url.searchParams.get('pageNumber') ?? url.searchParams.get('page') ?? '1'),
			category: url.searchParams.get('category') || undefined,
			source:
				sourceParam && ['fdc', 'openfoodfacts', 'home-baked'].includes(sourceParam)
					? (sourceParam as 'fdc' | 'openfoodfacts' | 'home-baked')
					: undefined,
			sortBy:
				sortByParam && ['name', 'category', 'created_at'].includes(sortByParam)
					? (sortByParam as 'name' | 'category' | 'created_at')
					: 'name',
			sortOrder:
				sortOrderParam && ['asc', 'desc'].includes(sortOrderParam)
					? (sortOrderParam as 'asc' | 'desc')
					: 'asc'
		};

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
