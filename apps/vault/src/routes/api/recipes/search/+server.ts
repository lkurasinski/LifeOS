import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { typesense } from '$lib/server/typesense';
import {
	typesenseRecipeDocumentSchema,
	type RecipeSearchResult
} from '$domains/cookbook/recipe/server/integrations/typesense/recipe.typesense.schema';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '*';
	const perPage = Number(url.searchParams.get('per_page') ?? '12');
	const page = Number(url.searchParams.get('page') ?? '1');
	const difficulty = url.searchParams.get('difficulty');
	const tags = url.searchParams.get('tags')?.split(',').filter(Boolean);
	const mealTypes = url.searchParams.get('meal_types')?.split(',').filter(Boolean);

	try {
		const filterBy = [];

		// Always show public recipes
		filterBy.push('is_public:true');

		// Filter by difficulty if provided
		if (difficulty) {
			filterBy.push(`difficulty:=${difficulty}`);
		}

		// Filter by tags if provided
		if (tags && tags.length > 0) {
			const tagFilters = tags.map((tag) => `tags:=${tag}`).join(' && ');
			filterBy.push(tagFilters);
		}

		// Filter by meal types if provided
		if (mealTypes && mealTypes.length > 0) {
			const mealTypeFilters = mealTypes.map((type) => `meal_type:=${type}`).join(' || ');
			filterBy.push(`(${mealTypeFilters})`);
		}

		const result = await typesense
			.collections('recipes')
			.documents()
			.search({
				q,
				query_by: 'name_pl,name_en,description_pl,description_en,ingredient_names',
				per_page: perPage,
				page,
				sort_by: 'created_at:desc',
				filter_by: filterBy.join(' && ')
			});

		const hits = (result.hits ?? []).map((hit: any): RecipeSearchResult => {
			const doc = typesenseRecipeDocumentSchema.parse(hit.document);

			return {
				id: doc.id,
				userId: doc.user_id,
				userName: doc.user_name ?? null,
				namePl: doc.name_pl,
				nameEn: doc.name_en ?? null,
				descriptionPl: doc.description_pl ?? null,
				descriptionEn: doc.description_en ?? null,
				servings: doc.servings,
				prepTimeMinutes: doc.prep_time_minutes ?? null,
				cookTimeMinutes: doc.cook_time_minutes ?? null,
				difficulty: doc.difficulty ?? null,
				imageUrl: doc.image_url ?? null,
				awesomeness: doc.awesomeness ?? null,
				mealType: doc.meal_type,
				ingredients: doc.ingredients,
				ingredientNames: doc.ingredient_names,
				componentSlugs: doc.component_slugs,
				tags: doc.tags,
				createdAt: new Date(doc.created_at * 1000).toISOString(),
				updatedAt: new Date(doc.updated_at * 1000).toISOString()
			};
		});

		return json({
			items: hits,
			total: result.found ?? 0,
			page,
			perPage
		});
	} catch (error) {
		console.error('Typesense recipe search error:', error);
		return json({ items: [], total: 0, page: 1, perPage }, { status: 500 });
	}
};
