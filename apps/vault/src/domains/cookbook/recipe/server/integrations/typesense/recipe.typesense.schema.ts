import { z } from 'zod';
import { mealTypeSchema } from '../../../recipe.schema';

export const typesenseRecipeIngredientSchema = z.object({
	food_id: z.number(),
	food_name_pl: z.string().nullable().optional(),
	food_name_en: z.string(),
	amount: z.number().nullable().optional(),
	unit: z.enum(['gram', 'ml']),
	notes: z.string().nullable().optional()
});

export const typesenseRecipeDocumentSchema = z.object({
	id: z.string(),
	user_id: z.string(),
	user_name: z.string().nullable().optional(),
	name_pl: z.string(),
	name_en: z.string().nullable().optional(),
	description_pl: z.string().nullable().optional(),
	description_en: z.string().nullable().optional(),
	servings: z.number(),
	prep_time_minutes: z.number().nullable().optional(),
	cook_time_minutes: z.number().nullable().optional(),
	difficulty: z.enum(['easy', 'medium', 'hard']).nullable().optional(),
	is_public: z.boolean(),
	image_url: z.string().nullable().optional(),
	awesomeness: z.number().nullable().optional(),
	meal_type: z.array(mealTypeSchema).optional(),
	ingredients: z.array(typesenseRecipeIngredientSchema).optional(),
	ingredient_names: z.array(z.string()).optional(),
	component_slugs: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	energy_kcal: z.number().nullable().optional(),
	protein: z.number().nullable().optional(),
	fat: z.number().nullable().optional(),
	carbs: z.number().nullable().optional(),
	fiber: z.number().nullable().optional(),
	nutrients: z.record(z.string(), z.number()).optional(),
	energy_kcal_per_serving: z.number().nullable().optional(),
	protein_per_serving: z.number().nullable().optional(),
	fat_per_serving: z.number().nullable().optional(),
	carbs_per_serving: z.number().nullable().optional(),
	fiber_per_serving: z.number().nullable().optional(),
	created_at: z.number(),
	updated_at: z.number()
});

export const recipeSearchResultSchema = z.object({
	id: z.string(),
	userId: z.string(),
	userName: z.string().nullable().optional(),
	namePl: z.string(),
	nameEn: z.string().nullable().optional(),
	descriptionPl: z.string().nullable().optional(),
	descriptionEn: z.string().nullable().optional(),
	servings: z.number(),
	prepTimeMinutes: z.number().nullable().optional(),
	cookTimeMinutes: z.number().nullable().optional(),
	difficulty: z.enum(['easy', 'medium', 'hard']).nullable().optional(),
	imageUrl: z.string().nullable().optional(),
	awesomeness: z.number().nullable().optional(),
	mealType: z.array(mealTypeSchema).optional(),
	ingredients: z.array(typesenseRecipeIngredientSchema).optional(),
	ingredientNames: z.array(z.string()).optional(),
	componentSlugs: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	energyKcalPerServing: z.number().nullable().optional(),
	proteinPerServing: z.number().nullable().optional(),
	fatPerServing: z.number().nullable().optional(),
	carbsPerServing: z.number().nullable().optional(),
	fiberPerServing: z.number().nullable().optional(),
	nutrients: z.record(z.string(), z.number()).optional(),
	createdAt: z.string(),
	updatedAt: z.string()
});

export type TypesenseRecipeDocument = z.infer<typeof typesenseRecipeDocumentSchema>;
export type RecipeSearchResult = z.infer<typeof recipeSearchResultSchema>;
export type TypesenseRecipeIngredient = z.infer<typeof typesenseRecipeIngredientSchema>;
