import type { Food, FoodSource, FoodNutrientAmount } from '../../domain/food.types';
import { Prisma } from '@lifeos/db/client';
import type { FoodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';
import { $Enums } from '@lifeos/db';
import type { Unit } from '$contracts/shared/Unit.dto';

export function prismaFoodToDomain(
	foodData: Prisma.FoodGetPayload<{
		include: {
			nutritions: {
				include: {
					nutrition: true;
				};
			};
		};
	}>
): Food {
	return {
		id: foodData.id,
		name: {
			en: foodData.nameEn,
			pl: foodData.namePl || undefined
		},
		category: foodData.category || undefined,
		scientificName: foodData.scientificName || undefined,
		brand: foodData.brand || undefined,
		imageUrl: foodData.imageUrl || undefined,
		source: {
			externalId: foodData.sourceExternalId || undefined,
			url: foodData.sourceUrl || undefined,
			provider: matchSourceProvider(foodData.sourceProvider)
		},
		nutrients: foodData.nutritions.map((el) => ({
			nutrient: {
				code: el.nutritionId,
				name: { en: el.nutrition.nameEn || undefined, pl: el.nutrition.namePl || undefined },
				categoryId: el.nutrition.categoryId || undefined,
				unit: matchNutritionUnit(el.nutrition.unit),
				description: {
					en: el.nutrition.descriptionEn || undefined,
					pl: el.nutrition.descriptionPl || undefined
				}
			},
			amount: el.amount
		})),
		userId: foodData.userId || undefined,
		createdAt: foodData.createdAt,
		updatedAt: foodData.updatedAt
	};
}

const matchSourceProvider = (source: string | undefined | null): FoodSourceProviders => {
	switch (source) {
		case 'fdc':
		case 'openfoodfacts':
		case 'home-baked':
			return source;
		default:
			return 'home-baked';
	}
};

const matchNutritionUnit = (source: $Enums.NutritionUnit): Unit => {
	switch (source) {
		case 'kJ':
		case 'kcal':
		case 'mcg':
		case 'mg':
		case 'g':
		case 'IU':
		case 'none':
			return source;
		default:
			return 'mcg';
	}
};
