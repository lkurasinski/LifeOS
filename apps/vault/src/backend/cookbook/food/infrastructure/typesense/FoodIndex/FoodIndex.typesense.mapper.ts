import type { Food, FoodNutrientAmount } from '$backend/cookbook/food/domain/food.types';
import type { Typesense_FoodDocument } from '$backend/cookbook/food/infrastructure/typesense/FoodCatalog/FoodCatalog.typesense.schema';
import { NUTRIENTS } from '$backend/cookbook/common/nutrient/nutrient';
import {
	getEnergyKcal,
	getFoodNutrientAmount,
	SKIPPED_NUTRIENTS,
	sortNutrientsByAmount
} from '$backend/cookbook/food/domain/food';
import { foodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';

export function mapFoodToTypesenseDoc(food: Food): Typesense_FoodDocument {
	if (!food.id || !food.createdAt || !food.updatedAt) {
		throw new Error('mapFoodToTypesenseDoc failed.');
	}

	return {
		id: food.id.toString(),
		name_pl: food.name.pl || undefined,
		name_en: food.name.en || food.id.toString(),
		scientific_name: food.scientificName || undefined,
		brand: food.brand || undefined,
		protein: getFoodNutrientAmount(food, NUTRIENTS.PROTCNT_g.code),
		carbs: getFoodNutrientAmount(food, NUTRIENTS.CHOCDF_g.code),
		fiber: getFoodNutrientAmount(food, NUTRIENTS.FIBTG_g.code),
		fat: getFoodNutrientAmount(food, NUTRIENTS.FAT_g.code),
		energy_kcal: getEnergyKcal(food),
		created_at: Math.floor(food.createdAt.getTime() / 1000),
		updated_at: Math.floor(food.updatedAt.getTime() / 1000),
		category: food.category || undefined,
		source_provider: food.source?.provider || 'home-baked',
		source_external_id: food.source?.externalId || undefined,
		source_url: 'toberemoved',
		nutrients: food.nutrients.reduce((acc, curr) => {
			return {
				...acc,
				[curr.nutrient.code]: curr.amount
			};
		}, {})
	};
}
