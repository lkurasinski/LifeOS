import { z } from 'zod';
import { foodSchema } from '$domains/cookbook/foods';

export const MEAL_TYPES = [
	'BREAKFAST',
	'BRUNCH',
	'LUNCH',
	'DINNER',
	'APPETIZER',
	'DESSERT',
	'SNACK',
	'BEVERAGE',
	'SALAD',
	'SOUP'
] as const;

export const DIFFICULTY_TYPES = ['easy', 'medium', 'hard'] as const;

export const mealTypes = z.enum(MEAL_TYPES);

export const recipeDifficultySchema = z.enum(DIFFICULTY_TYPES).nullable().optional();

export const recipeIngredientSchema = z.object({
	food: foodSchema,
	amount: z.number().positive('Amount must be positive').optional().nullable(),
	unit: z.enum(['gram', 'ml']).default('gram'),
	notes: z.string().optional()
});

export const recipeInstructionSchema = z.object({
	stepNumber: z.number().int().positive(),
	titlePl: z.string().optional(),
	titleEn: z.string().optional(),
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
	difficulty: recipeDifficultySchema,
	isPublic: z.boolean().default(true),
	imageUrl: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
	mealType: z.array(mealTypes).default([]),
	ingredients: z.array(recipeIngredientSchema).min(1, 'At least one ingredient is required'),
	instructions: z.array(recipeInstructionSchema),
	tags: z.array(z.string()).optional()
});

export type RecipeFormSchema = z.infer<typeof recipeFormSchema>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type RecipeInstruction = z.infer<typeof recipeInstructionSchema>;
export type MealType = z.infer<typeof mealTypes>;
