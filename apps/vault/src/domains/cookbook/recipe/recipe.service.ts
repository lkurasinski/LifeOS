import { prisma } from '$lib/server/prisma';
import { createSlugWithSuffix, isUniqueConstraintError } from '$lib/server/slug';
import type { CreateRecipeInput } from './recipe.api.schema';
import { mapCreateInputToRecipeData, type RecipeWithRelations } from './recipe.mappers';

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function createRecipe(
	input: CreateRecipeInput,
	userId: number
): Promise<RecipeWithRelations> {
	console.log('Creating Recipe... *****************');
	console.log(input);
	const slug = await generateUniqueSlug(input.namePl);
	const recipeData = mapCreateInputToRecipeData(input, userId, slug);

	const recipe = await prisma.$transaction(async (tx) => {
		const created = await tx.recipe.create({
			data: recipeData,
			include: {
				ingredients: true,
				instructions: true
			}
		});

		if (input.tags && input.tags.length > 0) {
			await attachTags(tx, created.id, input.tags);
		}

		return created;
	});

	return recipe;
}

async function generateUniqueSlug(name: string): Promise<string> {
	let slugSuffix: number | undefined;

	while (true) {
		const slug = createSlugWithSuffix(name, slugSuffix);

		try {
			await prisma.recipe.findUniqueOrThrow({
				where: { slug },
				select: { id: true }
			});

			slugSuffix = (slugSuffix ?? 1) + 1;
		} catch {
			return slug;
		}
	}
}

async function attachTags(
	tx: PrismaTransaction,
	recipeId: number,
	tagNames: string[]
): Promise<void> {
	const tags = await Promise.all(
		tagNames.map(async (namePl) => {
			const existing = await tx.tag.findUnique({
				where: { namePl }
			});

			if (existing) {
				return existing;
			}

			return await createTagWithUniqueSlug(tx, namePl);
		})
	);

	await tx.recipeTag.createMany({
		data: tags.map((tag) => ({
			recipeId,
			tagId: tag.id
		})),
		skipDuplicates: true
	});
}

async function createTagWithUniqueSlug(tx: PrismaTransaction, namePl: string) {
	let tagSlugSuffix: number | undefined;

	while (true) {
		const tagSlug = createSlugWithSuffix(namePl, tagSlugSuffix);

		try {
			return await tx.tag.create({
				data: {
					slug: tagSlug,
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
}
