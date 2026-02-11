import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { createFoodController } from '$backend/cookbook/food/api/createFood.controller';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const body = await request.json();

	return createFoodController(body, locals.user.id);
};
