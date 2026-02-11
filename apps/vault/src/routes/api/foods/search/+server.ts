import type { RequestHandler } from './$types';
import { searchFoodController } from '$backend/cookbook/food/api/searchFood.controller';
import { getFoodByIdController } from '$backend/cookbook/food/api/getFoodById.controller';
import { json } from '@sveltejs/kit';
import { ApiError } from '$backend/common/utils/api.utils';
import { z } from 'zod';

export const GET: RequestHandler = async ({ url }): Promise<Response> => {
	try {
		return searchFoodController(url.searchParams);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid food data', details: error.issues }, { status: 500 });
		}

		if (error instanceof ApiError) {
			return json({ error: error.message }, { status: 502 });
		}

		console.error('Unexpected error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
