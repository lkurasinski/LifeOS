import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { createRecipeInputSchema } from '$domains/cookbook/recipe/recipe.api.schema';
import { createRecipe } from '$domains/cookbook/recipe/recipe.service';
import { mapRecipeToResponse } from '$domains/cookbook/recipe/recipe.mappers';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const userId = locals.user?.id;
		if (!userId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		console.log('dduuaaappppaa', body);
		const input = createRecipeInputSchema.parse(body);
		console.log('dupa2');

		const recipe = await createRecipe(input, userId);
		const response = mapRecipeToResponse(recipe);

		return json(response, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid data', details: error.issues }, { status: 400 });
		}

		console.error('Create recipe error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
