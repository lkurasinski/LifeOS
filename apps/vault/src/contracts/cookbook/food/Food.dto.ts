import { z } from 'zod';
import { foodDataSourceDto } from '$lib';
import { unit } from '../../shared/Unit.dto';
import { localizedStringDto } from '$contracts/shared/LocalizedString.dto';

export const nutrientSchema = z.object({
	code: z.string().min(1),
	name: localizedStringDto,
	unit: unit,
	description: localizedStringDto.optional(),
	categoryId: z.string()
});

export type NutrientDto = z.infer<typeof nutrientSchema>;

export const foodNutrientDtoSchema = z.object({
	nutrient: nutrientSchema,
	amount: z.number()
});

export type FoodNutrientDto = z.infer<typeof foodNutrientDtoSchema>;

// ============================================================================
// CORE ENTITY
// ============================================================================
export const foodCoreDtoSchema = z.object({
	name: localizedStringDto,
	category: z.string().optional(),
	scientificName: z.string().optional(),
	brand: z.string().optional(),
	imageUrl: z.string().url().optional(),
	source: foodDataSourceDto.optional(),
	nutrients: z.array(
		z.object({
			code: z.string(),
			amount: z.number().nonnegative()
		})
	)
});
export type FoodCoreDto = z.infer<typeof foodCoreDtoSchema>;

export const foodDtoSchema = foodCoreDtoSchema.extend({
	id: z.number().optional(),
	userId: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	nutrients: z.array(foodNutrientDtoSchema).optional()
});

export type FoodDto = z.infer<typeof foodDtoSchema>;

// ============================================================================
// COMMANDS (Simplified inputs for operations)
// ============================================================================

export const updateFoodCommandSchema = z.object({
	id: z.string(),
	name: localizedStringDto,
	category: z.string().optional(),
	scientificName: z.string().optional(),
	brand: z.string().optional(),
	nutrients: z
		.array(
			z.object({
				code: z.string(),
				amount: z.number().nonnegative()
			})
		)
		.optional()
});

export type UpdateFoodCommand = z.infer<typeof updateFoodCommandSchema>;
