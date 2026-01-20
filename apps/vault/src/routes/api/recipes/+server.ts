import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { createRecipeInputSchema } from '$domains/cookbook/recipe/recipe.api.schema';
import { createRecipeInDb } from '$domains/cookbook/recipe/recipe.service';
import { indexRecipe } from '$domains/cookbook/recipe/server/integrations/typesense/recipe.typesense.indexation';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const userId = locals.user?.id;
		if (!userId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const input = createRecipeInputSchema.parse(body);

		const recipe = await createRecipeInDb(input, userId);

		// Index to Typesense (non-blocking, don't fail request if indexing fails)
		indexRecipe(recipe.id).catch((err) => {
			console.error('Failed to index recipe to Typesense', { recipeId: recipe.id, err });
		});

		return json({ status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid data', details: error.issues }, { status: 400 });
		}

		console.error('Create recipe error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
