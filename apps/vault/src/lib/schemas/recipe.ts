import { z } from 'zod';

export const recipeIngredientSchema = z.object({
	foodId: z.coerce.number(),
	foodName: z.string().min(1, 'Food name is required'),
	amount: z.number().positive('Amount must be positive').optional(),
	unit: z.enum(['gram', 'ml']).default('gram'),
	notes: z.string().optional()
});

export const recipeInstructionSchema = z.object({
	stepNumber: z.number().int().positive(),
	descriptionPl: z.string().min(1, 'Instruction text is required'),
	descriptionEn: z.string().optional()
});

export const recipeFormSchema = z.object({
	namePl: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
	nameEn: z.string().max(200, 'Name is too long').optional(),
	descriptionPl: z.string().optional(),
	descriptionEn: z.string().optional(),
	servings: z.coerce.number().int().positive('Servings must be at least 1').default(1),
	prepTimeMinutes: z.coerce.number().int().positive('Prep time must be positive').optional(),
	cookTimeMinutes: z.coerce.number().int().positive('Cook time must be positive').optional(),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
	isPublic: z.boolean().default(true),
	imageUrl: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
	ingredients: z.array(recipeIngredientSchema).min(1, 'At least one ingredient is required'),
	instructions: z.array(recipeInstructionSchema),
	tags: z.array(z.string()).optional()
});

export type RecipeFormSchema = z.infer<typeof recipeFormSchema>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type RecipeInstruction = z.infer<typeof recipeInstructionSchema>;

// Typesense document schemas
export const typesenseRecipeIngredientSchema = z.object({
	food_id: z.string(),
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
	ingredients: z.array(typesenseRecipeIngredientSchema).optional(),
	ingredient_names: z.array(z.string()).optional(),
	component_slugs: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
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
	ingredients: z.array(typesenseRecipeIngredientSchema).optional(),
	ingredientNames: z.array(z.string()).optional(),
	componentSlugs: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	createdAt: z.string(),
	updatedAt: z.string()
});

export type TypesenseRecipeDocument = z.infer<typeof typesenseRecipeDocumentSchema>;
export type RecipeSearchResult = z.infer<typeof recipeSearchResultSchema>;
