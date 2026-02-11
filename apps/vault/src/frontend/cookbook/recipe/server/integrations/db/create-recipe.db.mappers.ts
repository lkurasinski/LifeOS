import type { Recipe, RecipeIngredient, Instruction, MealType, Prisma } from '@lifeos/db';
import type {
	CreateRecipeInput,
	CreateRecipeResponse,
	CreateRecipeIngredientInput,
	CreateRecipeInstructionInput
} from '../../../recipe.api.schema';

export type RecipeWithRelations = Recipe & {
	ingredients: RecipeIngredient[];
	instructions: Instruction[];
};

export function mapCreateInputToRecipeDb(
	input: CreateRecipeInput,
	userId: number,
	slug: string
): Prisma.RecipeCreateInput {
	return {
		user: {
			connect: { id: userId }
		},
		namePl: input.namePl,
		nameEn: input.nameEn,
		descriptionPl: input.descriptionPl,
		descriptionEn: input.descriptionEn,
		servings: input.servings,
		prepTimeMinutes: input.prepTimeMinutes ?? null,
		cookTimeMinutes: input.cookTimeMinutes ?? null,
		difficulty: input.difficulty ?? null,
		isPublic: input.isPublic ?? false,
		imageUrl: input.imageUrl ?? null,
		slug,
		awesomeness: input.awesomeness ?? null,
		mealType: input.mealType as MealType[],
		ingredients: {
			create: input.ingredients.map((ing, index) => ({
				foodId: ing.foodId,
				amount: ing.amount ?? null,
				unit: ing.unit,
				notes: ing.notes ?? null,
				order: index
			}))
		},
		instructions: input.instructions
			? {
					create: input.instructions.map((step) => ({
						stepNumber: step.stepNumber,
						descriptionPl: step.descriptionPl,
						descriptionEn: step.descriptionEn ?? null
					}))
				}
			: undefined
	};
}
