import { z } from 'zod';
import { mealTypes } from './recipe.schema';

export const createRecipeIngredientInputSchema = z.object({
	foodId: z.coerce.number(),
	amount: z.number().positive().optional(),
	unit: z.enum(['gram', 'ml']).default('gram'),
	notes: z.string().optional()
});

export const createRecipeInstructionInputSchema = z.object({
	stepNumber: z.number().int().positive(),
	descriptionPl: z.string().min(1),
	descriptionEn: z.string().optional()
});

export const createRecipeInputSchema = z.object({
	namePl: z.string().min(1),
	nameEn: z.string().optional(),
	descriptionPl: z.string().optional(),
	descriptionEn: z.string().optional(),
	servings: z.number().int().positive().default(1),
	prepTimeMinutes: z.number().int().positive().optional(),
	cookTimeMinutes: z.number().int().positive().optional(),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
	isPublic: z.boolean().optional().default(true),
	imageUrl: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
	awesomeness: z.number().int().min(1).max(5).optional(),
	mealType: z.array(mealTypes).default([]),
	ingredients: z.array(createRecipeIngredientInputSchema).min(1),
	instructions: z.array(createRecipeInstructionInputSchema).optional(),
	tags: z.array(z.string()).optional()
});

export const createRecipeResponseSchema = z.object({
	id: z.number(),
	userId: z.number(),
	namePl: z.string(),
	nameEn: z.string().nullable(),
	descriptionPl: z.string().nullable(),
	descriptionEn: z.string().nullable(),
	servings: z.number(),
	prepTimeMinutes: z.number().nullable(),
	cookTimeMinutes: z.number().nullable(),
	difficulty: z.string().nullable(),
	isPublic: z.boolean(),
	imageUrl: z.string().nullable(),
	slug: z.string(),
	awesomeness: z.number().nullable(),
	mealType: z.array(z.string()),
	createdAt: z.date(),
	updatedAt: z.date(),
	ingredients: z.array(
		z.object({
			recipeId: z.number(),
			foodId: z.number(),
			amount: z.number().nullable(),
			unit: z.string(),
			notes: z.string().nullable(),
			order: z.number()
		})
	),
	instructions: z.array(
		z.object({
			recipeId: z.number(),
			stepNumber: z.number(),
			titlePl: z.string().nullable(),
			titleEn: z.string().nullable(),
			descriptionPl: z.string(),
			descriptionEn: z.string().nullable()
		})
	)
});

export type CreateRecipeInput = z.infer<typeof createRecipeInputSchema>;
export type CreateRecipeIngredientInput = z.infer<typeof createRecipeIngredientInputSchema>;
export type CreateRecipeInstructionInput = z.infer<typeof createRecipeInstructionInputSchema>;
export type CreateRecipeResponse = z.infer<typeof createRecipeResponseSchema>;
