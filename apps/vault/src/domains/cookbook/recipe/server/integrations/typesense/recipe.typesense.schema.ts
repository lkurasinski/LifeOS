import { z } from 'zod';
import { DIFFICULTY_TYPES, mealTypes } from '../../../recipe.schema';
import { Unit } from '$lib/schemas/unit.schema';

export const typesenseRecipeIngredientSchema = z.object({
	food_id: z.number(),
	food_name_pl: z.string().optional(),
	food_name_en: z.string(),
	amount: z.number().optional(),
	unit: Unit,
	notes: z.string().optional()
});

export const typesenseRecipeDifficultySchema = z.enum(DIFFICULTY_TYPES).optional();

export const typesenseRecipeDocumentSchema = z.object({
	id: z.string(),
	slug: z.string(),
	user_id: z.string(),
	user_name: z.string().optional(),
	name_pl: z.string(),
	name_en: z.string().optional(),
	description_pl: z.string().optional(),
	description_en: z.string().optional(),
	servings: z.number(),
	prep_time_minutes: z.number().optional(),
	cook_time_minutes: z.number().optional(),
	difficulty: typesenseRecipeDifficultySchema,
	is_public: z.boolean(),
	image_url: z.string().optional(),
	awesomeness: z.number().optional(),
	meal_type: z.array(mealTypes).optional(),
	ingredients: z.array(typesenseRecipeIngredientSchema).optional(),
	ingredient_names: z.array(z.string()).optional(),
	component_slugs: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	energy_kcal: z.number().optional(),
	protein: z.number().optional(),
	fat: z.number().optional(),
	carbs: z.number().optional(),
	fiber: z.number().optional(),
	nutrients: z.record(z.string(), z.number()).optional(),
	energy_kcal_per_serving: z.number().optional(),
	protein_per_serving: z.number().optional(),
	fat_per_serving: z.number().optional(),
	carbs_per_serving: z.number().optional(),
	fiber_per_serving: z.number().optional(),
	created_at: z.number(),
	updated_at: z.number()
});

export type TypesenseRecipeDifficulty = z.infer<typeof typesenseRecipeDifficultySchema>;
export type TypesenseRecipeDocument = z.infer<typeof typesenseRecipeDocumentSchema>;
export type TypesenseRecipeIngredient = z.infer<typeof typesenseRecipeIngredientSchema>;
