import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStrategy } from '../../../../lib/services/food-sources';

export const GET: RequestHandler = async ({ params, url }) => {
	const { id } = params;
	const source = url.searchParams.get('source') || 'internal';

	if (!id) {
		return json({ error: 'ID parameter is required' }, { status: 400 });
	}

	try {
		const strategy = getStrategy(source);
		const food = await strategy.getById(id);

		return json(food);
	} catch (error) {
		console.error('Food detail error:', error);
		const message = error instanceof Error ? error.message : 'Failed to fetch food details';
		return json({ error: message }, { status: 500 });
	}
};
