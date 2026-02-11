/**
 * Mappers to convert OpenFoodFacts API types to Domain Models
 *
 * These mappers are used at the integration boundary to transform
 * external OpenFoodFacts types into our canonical dto Food models.
 */

import type { OFFProductV1, OFFProductLicious, OFFProductDetail } from './types';
import { OFF_TO_INFOODS } from './openfoodfacts-nutrient-mapping';
import type { Food, FoodNutrientAmount } from '$backend/cookbook/food/domain/food.types';
import { sortNutrientsByAmount } from '$backend/cookbook/food/domain/food';
import { NUTRIENTS } from '$backend/cookbook/common/nutrient/nutrient';

/**
 * Convert OpenFoodFacts nutriments to dto NutrientValue array
 */
function mapNutrimentsToNutrients(
	nutriments: Record<string, number | string | undefined> | undefined
): FoodNutrientAmount[] {
	if (!nutriments) return [];

	const nutrients: FoodNutrientAmount[] = [];

	for (const [offKey, value] of Object.entries(nutriments)) {
		const infoodsCode = OFF_TO_INFOODS[offKey];
		if (!infoodsCode) continue;

		const nutrientDef = NUTRIENTS[infoodsCode];
		if (!nutrientDef) continue;

		if (typeof value !== 'number' || value < 0) continue;

		nutrients.push({
			nutrient: {
				code: infoodsCode,
				name: {
					pl: nutrientDef.name_pl,
					en: nutrientDef.name_en
				},
				unit: nutrientDef.unit,
				categoryId: nutrientDef.category,
				description: undefined
			},
			amount: value
		});
	}

	return nutrients.sort(sortNutrientsByAmount);
}

export function mapOFFProductV1ToFood(offProduct: OFFProductV1): Food {
	return {
		id: undefined,
		createdAt: undefined,
		updatedAt: undefined,
		name: {
			en: offProduct.product_name_en || offProduct.product_name || offProduct.code || 'Unknown',
			pl: offProduct.product_name_pl || offProduct.product_name || offProduct.code || 'Unknown'
		},
		category: offProduct.categories?.split(',')[0]?.trim() || undefined,
		scientificName: offProduct.generic_name_en || offProduct.generic_name || undefined,
		brand: offProduct.brands || undefined,
		imageUrl: offProduct.image_front_url || undefined,
		nutrients: mapNutrimentsToNutrients(offProduct.nutriments),
		source: {
			provider: 'openfoodfacts',
			externalId: offProduct.code || undefined,
			url: offProduct.url || undefined
		},
		userId: undefined
	};
}

/**
 * Map OpenFoodFacts Search-a-licious result to dto Food model
 */
export function mapOFFProductLiciousToFood(offProduct: OFFProductLicious): Food {
	return {
		id: undefined,
		createdAt: undefined,
		updatedAt: undefined,
		name: {
			en: offProduct.product_name_en || offProduct.product_name || offProduct.code || 'Unknown',
			pl: offProduct.product_name_pl || offProduct.product_name || offProduct.code || 'Unknown'
		},
		category: offProduct.categories?.split(',')[0]?.trim() || undefined,
		scientificName: undefined,
		brand: offProduct.brands || undefined,
		imageUrl: offProduct.image_front_url || undefined,
		nutrients: mapNutrimentsToNutrients(offProduct.nutriments),
		source: {
			provider: 'openfoodfacts',
			externalId: offProduct.code || undefined,
			url: offProduct.url || undefined
		},
		userId: undefined
	};
}

/**
 * Map OpenFoodFacts product detail to dto Food model
 */
export function mapOFFProductDetailToFood(offProduct: OFFProductDetail): Food {
	return {
		id: undefined,
		createdAt: undefined,
		updatedAt: undefined,
		name: {
			en: offProduct.product_name_en || offProduct.product_name || offProduct.code || 'Unknown',
			pl: offProduct.product_name_pl || offProduct.product_name || offProduct.code || 'Unknown'
		},
		category: offProduct.categories?.split(',')[0]?.trim() || undefined,
		scientificName: offProduct.generic_name_en || offProduct.generic_name || undefined,
		brand: offProduct.brands || undefined,
		imageUrl: offProduct.image_front_url || undefined,
		nutrients: mapNutrimentsToNutrients(offProduct.nutriments),
		source: {
			provider: 'openfoodfacts',
			externalId: offProduct.code || undefined,
			url: offProduct.url || undefined
		},
		userId: undefined
	};
}
