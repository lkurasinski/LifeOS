import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { createFoodCommandSchema, type CreateFoodCommand } from '$lib/domain/cookbook/foods';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();

		// Validate using domain CreateFoodCommand schema
		const command = createFoodCommandSchema.parse(body);

		// Create food with nutrition data in transaction
		const food = await prisma.$transaction(async (tx) => {
			// Build source URL based on provider
			let sourceUrl: string | null = null;
			if (command.source?.provider === 'fdc' && command.source.externalId) {
				sourceUrl = `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${command.source.externalId}/nutrients`;
			}

			// Create the food record
			const createdFood = await tx.food.create({
				data: {
					nameEn: command.name_en,
					namePl: command.name_pl || null,
					category: command.category || null,
					scientificName: command.scientificName || null,
					brand: command.brand || null,
					userId: command.source?.provider === 'custom' ? user.id : null,
					// Source tracking columns
					sourceProvider: command.source?.provider || null,
					sourceExternalId: command.source?.externalId?.toString() || null,
					sourceUrl
				}
			});

			// Create nutrition entries
			if (command.nutrients.length > 0) {
				await tx.foodNutrition.createMany({
					data: command.nutrients.map((n) => ({
						foodId: createdFood.id,
						nutritionId: n.code,
						amount: n.value
					})),
					skipDuplicates: true
				});
			}

			return createdFood;
		});

		return json(
			{
				id: food.id,
				name_en: food.nameEn,
				name_pl: food.namePl
			},
			{ status: 201 }
		);
	} catch (error: unknown) {
		if (error && typeof error === 'object' && 'issues' in error) {
			return json(
				{ error: 'Invalid request data', details: (error as any).issues },
				{ status: 400 }
			);
		}

		// Handle Prisma unique constraint violation (duplicate fdcId)
		if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
			return json({ error: 'This food already exists in the database' }, { status: 409 });
		}

		console.error('Food creation error:', error);
		return json({ error: 'Failed to create food' }, { status: 500 });
	}
};
