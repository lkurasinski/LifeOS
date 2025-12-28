import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { createSlugWithSuffix, isUniqueConstraintError } from '$lib/server/slug';
import { z } from 'zod';

const ingredientSchema = z.object({
	foodId: z.string(),
	amount: z.number().positive().optional(),
	unit: z.enum(['gram', 'ml']).default('gram'),
	notes: z.string().optional()
});

const recipeSchema = z.object({
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

		let slugSuffix: number | undefined;
		let recipe;

		while (true) {
			const slug = createSlugWithSuffix(data.namePl, slugSuffix);

			try {
				recipe = await prisma.$transaction(async (tx) => {
					const created = await tx.recipe.create({
						data: {
							userId,
							namePl: data.namePl,
							name_en: data.nameEn,
							descriptionPl: data.descriptionPl,
							descriptionEn: data.descriptionEn,
							servings: data.servings,
							prepTimeMinutes: data.prepTimeMinutes ? data.prepTimeMinutes : undefined,
							cookTimeMinutes: data?.cookTimeMinutes ? data.cookTimeMinutes : undefined,
							difficulty: data.difficulty,
							isPublic: data.isPublic ?? false,
							imageUrl: data?.imageUrl,
							slug,
							awesomeness: data.awesomeness,
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
							data.tags.map(async (namePl) => {
								const existing = await tx.tag.findUnique({
									where: { namePl }
								});

								if (existing) {
									return existing;
								}

								let tagSlugSuffix: number | undefined;
								while (true) {
									const tagSlug = createSlugWithSuffix(namePl, tagSlugSuffix);
									try {
										return await tx.tag.create({
											data: {
												id: tagSlug,
												namePl
											}
										});
									} catch (error) {
										if (isUniqueConstraintError(error)) {
											tagSlugSuffix = (tagSlugSuffix ?? 1) + 1;
											continue;
										}
										throw error;
									}
								}
							})
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

				break;
			} catch (error) {
				if (isUniqueConstraintError(error)) {
					slugSuffix = (slugSuffix ?? 1) + 1;
					continue;
				}
				throw error;
			}
		}

		return json(recipe, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid data', details: error.issues }, { status: 400 });
		}

		console.error('Create recipe error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
