import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import type { FDCFoodDetail, FoodNutrient } from '$lib/integrations/fdc/client';
import { mapFDCNutrientsForDB } from '$lib/integrations/fdc/mappers';
import { z } from 'zod';

const createFoodSchema = z.object({
	fdcData: z.any(), // Using any since it's already validated by FDC API types
	overrides: z
		.object({
			namePl: z.string().optional(),
			nameEn: z.string().optional(),
			category: z.string().optional(),
			scientificName: z.string().optional()
		})
		.optional()
});

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const validatedData = createFoodSchema.parse(body);
		const { fdcData, overrides } = validatedData;

		const fdcFood = fdcData as FDCFoodDetail;

		// Normalize FDC nutrients to INFOODS codes using mapper
		const nutrients = mapFDCNutrientsForDB((fdcFood as any).foodNutrients || []);

		// Extract food category from the different food types
		let foodCategory: string | undefined;
		if ('foodCategory' in fdcFood && fdcFood.foodCategory) {
			foodCategory =
				typeof fdcFood.foodCategory === 'string'
					? fdcFood.foodCategory
					: fdcFood.foodCategory.description;
		} else if ('brandedFoodCategory' in fdcFood && fdcFood.brandedFoodCategory) {
			foodCategory = fdcFood.brandedFoodCategory;
		}

		const scientificName = 'scientificName' in fdcFood ? fdcFood.scientificName : undefined;

		// Create food with nutrition data
		const food = await prisma.$transaction(async (tx) => {
			// Create the food record
			const createdFood = await tx.food.create({
				data: {
					fdcId: fdcFood.fdcId,
					nameEn: overrides?.nameEn ?? fdcFood.description,
					namePl: overrides?.namePl ?? null,
					category: overrides?.category ?? foodCategory ?? null,
					scientificName: overrides?.scientificName ?? scientificName ?? null,
					isCustom: false,
					userId: null // FDC foods are public/shared
				}
			});

			// Create nutrition entries
			if (nutrients.length > 0) {
				await tx.foodNutrition.createMany({
					data: nutrients.map((n) => ({
						foodId: createdFood.id,
						nutritionId: n.code,
						value: n.value
					})),
					skipDuplicates: true
				});
			}

			return createdFood;
		});

		return json(food, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
		}
		console.error('Food creation error:', error);
		return json({ error: 'Failed to create food' }, { status: 500 });
	}
};
