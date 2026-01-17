/**
 * Typesense indexing utilities for Recipes
 */

import { prisma } from '$lib/server/prisma';
import { typesense } from '$lib/server/typesense';
import { logger } from '$lib/server/logger/logger';
import type { RecipeDocument } from './types';

const COLLECTION_NAME = 'recipes';

/**
 * Fetch recipe from database with all relations
 */
async function fetchRecipeWithRelations(recipeId: number) {
	return await prisma.recipe.findUnique({
		where: { id: recipeId },
		include: {
			user: {
				select: { name: true }
			},
			ingredients: {
				include: {
					food: {
						select: {
							id: true,
							namePl: true,
							nameEn: true
						}
					}
				},
				orderBy: { order: 'asc' }
			},
			tags: {
				include: {
					tag: {
						select: { namePl: true }
					}
				}
			},
			includesRecipes: {
				include: {
					component: {
						select: { slug: true }
					}
				}
			}
		}
	});
}

/**
 * Transform Recipe model to Typesense document
 */
function transformRecipeToDocument(
	recipe: NonNullable<Awaited<ReturnType<typeof fetchRecipeWithRelations>>>
): RecipeDocument {
	// Map ingredients
	const ingredients = recipe.ingredients.map((ing) => ({
		food_id: ing.foodId,
		food_name_pl: ing.food.namePl ?? undefined,
		food_name_en: ing.food.nameEn,
		amount: ing.amount ?? undefined,
		unit: ing.unit,
		notes: ing.notes ?? undefined
	}));

	// Extract ingredient names for search
	const ingredientNames = recipe.ingredients
		.map((ing) => [ing.food.namePl, ing.food.nameEn])
		.flat()
		.filter((name): name is string => !!name);

	// Extract tag names
	const tags = recipe.tags.map((rt) => rt.tag.namePl);

	// Extract component recipe slugs
	const componentSlugs = recipe.includesRecipes.map((rc) => rc.component.slug);

	const doc: RecipeDocument = {
		id: String(recipe.id),
		slug: recipe.slug,
		user_id: String(recipe.userId),
		name_pl: recipe.namePl,
		servings: recipe.servings,
		is_public: recipe.isPublic,
		meal_type: recipe.mealType,
		created_at: Math.floor(recipe.createdAt.getTime() / 1000),
		updated_at: Math.floor(recipe.updatedAt.getTime() / 1000)
	};

	// Optional fields
	if (recipe.user?.name) doc.user_name = recipe.user.name;
	if (recipe.nameEn) doc.name_en = recipe.nameEn;
	if (recipe.descriptionPl) doc.description_pl = recipe.descriptionPl;
	if (recipe.descriptionEn) doc.description_en = recipe.descriptionEn;
	if (recipe.prepTimeMinutes) doc.prep_time_minutes = recipe.prepTimeMinutes;
	if (recipe.cookTimeMinutes) doc.cook_time_minutes = recipe.cookTimeMinutes;
	if (recipe.difficulty) doc.difficulty = recipe.difficulty;
	if (recipe.imageUrl) doc.image_url = recipe.imageUrl;
	if (recipe.awesomeness) doc.awesomeness = recipe.awesomeness;
	if (ingredients.length > 0) doc.ingredients = ingredients;
	if (ingredientNames.length > 0) doc.ingredient_names = ingredientNames;
	if (tags.length > 0) doc.tags = tags;
	if (componentSlugs.length > 0) doc.component_slugs = componentSlugs;

	return doc;
}

/**
 * Index a single recipe to Typesense
 * Returns true on success, false on failure
 */
export async function indexRecipe(recipeId: number): Promise<boolean> {
	try {
		// Fetch recipe with all relations
		const recipe = await fetchRecipeWithRelations(recipeId);

		if (!recipe) {
			logger.warn({ recipeId }, 'Recipe not found for indexing');
			return false;
		}

		// Only index public recipes
		if (!recipe.isPublic) {
			logger.info({ recipeId }, 'Skipping private recipe indexing');
			// Still update indexed_at to mark as processed
			try {
				await prisma.recipe.update({
					where: { id: recipeId },
					data: { indexedAt: new Date() } as any
				});
			} catch (err) {
				// Ignore if indexedAt field doesn't exist yet
			}
			return true;
		}

		// Transform to Typesense document
		const document = transformRecipeToDocument(recipe);

		// Upsert to Typesense
		await typesense.collections(COLLECTION_NAME).documents().upsert(document);

		// Update indexed_at timestamp (if field exists)
		try {
			await prisma.recipe.update({
				where: { id: recipeId },
				data: { indexedAt: new Date() } as any
			});
		} catch (err) {
			// Ignore if indexedAt field doesn't exist yet (migration pending)
			logger.warn({ recipeId }, 'Could not update indexedAt - migration may be pending');
		}

		logger.info({ recipeId, docId: document.id }, 'Recipe indexed successfully');
		return true;
	} catch (error) {
		logger.error({ recipeId, error }, 'Failed to index recipe to Typesense');
		return false;
	}
}

/**
 * Index multiple recipes in batch
 * Returns count of successfully indexed recipes
 */
export async function indexRecipesBatch(recipeIds: number[]): Promise<number> {
	let successCount = 0;

	for (const recipeId of recipeIds) {
		const success = await indexRecipe(recipeId);
		if (success) successCount++;
	}

	return successCount;
}

/**
 * Find recipes that need reindexing (updated_at > indexed_at or indexed_at is null)
 */
export async function findRecipesNeedingReindex(): Promise<number[]> {
	try {
		const recipes = await prisma.recipe.findMany({
			where: {
				OR: [
					{ indexedAt: null } as any,
					{
						updatedAt: {
							gt: (prisma.recipe.fields as any).indexedAt
						}
					}
				]
			},
			select: { id: true },
			orderBy: { updatedAt: 'desc' },
			take: 100 // Limit to avoid overwhelming
		});

		return recipes.map((r) => r.id);
	} catch (err) {
		// If indexedAt field doesn't exist yet, return empty array
		logger.warn('Could not find recipes needing reindex - migration may be pending');
		return [];
	}
}

/**
 * Remove recipe from Typesense (for deleted or made private recipes)
 */
export async function removeRecipeFromIndex(recipeId: number): Promise<boolean> {
	try {
		await typesense.collections(COLLECTION_NAME).documents(String(recipeId)).delete();
		logger.info({ recipeId }, 'Recipe removed from index');
		return true;
	} catch (error) {
		logger.error({ recipeId, error }, 'Failed to remove recipe from index');
		return false;
	}
}
