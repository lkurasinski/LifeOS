import { Prisma } from '@lifeos/db/client';
import type { CreateOrUpdateFoodCommand } from '$backend/cookbook/food/application/handleCreateFood.command';

export function foodDomainToPrismaCreate(
	food: CreateOrUpdateFoodCommand,
	userId?: number
): {
	foodData: Prisma.FoodUncheckedCreateInput;
	foodNutritionsData: Prisma.FoodNutritionCreateManyFoodInput[];
} {
	const foodData: Prisma.FoodUncheckedCreateInput = {
		nameEn: food.name.en || '',
		namePl: food.name.pl,
		category: food.category,
		scientificName: food.scientificName,
		brand: food.brand ?? null,
		imageUrl: food.imageUrl ?? null,
		sourceProvider: food.source?.provider ?? null,
		sourceExternalId: food.source?.externalId ?? null,
		sourceUrl: food.source?.url ?? null,
		userId: userId ?? null
	};

	const foodNutritionsData: Prisma.FoodNutritionCreateManyFoodInput[] = food.nutrients.map(
		(el) => ({
			nutritionId: el.code,
			amount: el.amount
		})
	);

	return { foodData, foodNutritionsData };
}

export function foodDomainToPrismaUpdate(
	food: CreateOrUpdateFoodCommand,
	userId?: number
): {
	foodData: Prisma.FoodUncheckedUpdateInput;
	foodNutritionsData: Prisma.FoodNutritionCreateManyFoodInput[];
} {
	const foodData: Prisma.FoodUncheckedUpdateInput = {
		nameEn: food.name.en || '',
		namePl: food.name.pl,
		category: food.category,
		scientificName: food.scientificName,
		brand: food.brand,
		imageUrl: food.imageUrl,
		sourceProvider: food.source?.provider ?? null,
		sourceExternalId: food.source?.externalId ?? null,
		sourceUrl: food.source?.url ?? null,
		userId: userId ?? null,
		indexedAt: food.indexedAt ?? null
	};

	const foodNutritionsData: Prisma.FoodNutritionCreateManyFoodInput[] = food.nutrients.map(
		(el) => ({
			nutritionId: el.code,
			amount: el.amount
		})
	);

	return { foodData, foodNutritionsData };
}
