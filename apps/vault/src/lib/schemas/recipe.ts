import { z } from 'zod';

export const recipeIngredientSchema = z.object({
	foodId: z.string().min(1, 'Food is required'),
	foodName: z.string().min(1, 'Food name is required'),
	amount: z.number().positive('Amount must be positive').optional(),
	unit: z.enum(['gram', 'ml']).default('gram'),
	notes: z.string().optional()
});

export const recipeInstructionSchema = z.object({
	stepNumber: z.number().int().positive(),
	textPl: z.string().min(1, 'Instruction text is required'),
	textEn: z.string().optional()
});

export const recipeFormSchema = z.object({
	titlePl: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
	titleEn: z.string().max(200, 'Title is too long').optional(),
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
