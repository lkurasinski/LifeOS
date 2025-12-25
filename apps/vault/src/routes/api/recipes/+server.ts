import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { z } from 'zod';

const ingredientSchema = z.object({
	foodId: z.string(),
	amount: z.number().positive().optional(),
	unit: z.enum(['gram', 'ml']).default('gram'),
	notes: z.string().optional()
});

const recipeSchema = z.object({
	titlePl: z.string().min(1),
	titleEn: z.string().optional(),
	descriptionPl: z.string().optional(),
	descriptionEn: z.string().optional(),
	servings: z.number().int().positive().default(1),
	prepTimeMinutes: z.number().int().positive().optional(),
	cookTimeMinutes: z.number().int().positive().optional(),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
	isPublic: z.boolean().optional().default(true),
	imageUrl: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
	ingredients: z.array(ingredientSchema).min(1),
	instructions: z
		.array(
			z.object({
				stepNumber: z.number().int().positive(),
				textPl: z.string().min(1),
				textEn: z.string().optional()
			})
		)
		.optional(),
	tags: z.array(z.string()).optional()
});

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const userId = locals.user?.id;
		if (!userId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		console.log('pre');
		const data = recipeSchema.parse(body);
		console.log(data);

		const recipe = await prisma.$transaction(async (tx) => {
			console.log('asd');
			const created = await tx.recipe.create({
				data: {
					userId,
					titlePl: data.titlePl,
					titleEn: data.titleEn,
					descriptionPl: data.descriptionPl,
					descriptionEn: data.descriptionEn,
					servings: data.servings,
					prepTimeMinutes: data.prepTimeMinutes ? data.prepTimeMinutes : undefined,
					cookTimeMinutes: data?.cookTimeMinutes ? data.cookTimeMinutes : undefined,
					difficulty: data.difficulty,
					isPublic: data.isPublic ?? false,
					imageUrl: data?.imageUrl,
					ingredients: {
						create: data.ingredients.map((ing, index) => ({
							foodId: ing.foodId,
							amount: ing.amount,
							unit: ing.unit,
							notes: ing.notes,
							order: index
						}))
					},
					instructions: {
						create: data.instructions?.map((step) => ({
							stepNumber: step.stepNumber,
							textPl: step.textPl,
							textEn: step.textEn
						}))
					}
				},
				include: {
					ingredients: true,
					instructions: true
				}
			});

			if (data.tags && data.tags.length > 0) {
				const tags = await Promise.all(
					data.tags.map((namePl) =>
						tx.tag.upsert({
							where: { namePl },
							create: { namePl },
							update: {}
						})
					)
				);

				await tx.recipeTag.createMany({
					data: tags.map((tag) => ({
						recipeId: created.id,
						tagId: tag.id
					})),
					skipDuplicates: true
				});
			}

			return created;
		});

		return json(recipe, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid data', details: error.issues }, { status: 400 });
		}

		console.error('Create recipe error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
