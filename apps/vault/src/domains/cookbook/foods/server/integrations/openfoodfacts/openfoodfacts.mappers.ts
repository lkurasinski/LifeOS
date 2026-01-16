/**
 * Mappers to convert OpenFoodFacts API types to Domain Models
 *
 * These mappers are used at the integration boundary to transform
 * external OpenFoodFacts types into our canonical domain Food models.
 */

import type { OFFProductV1, OFFProductLicious, OFFProductDetail } from './types';
import type { Food, NutrientValue } from '$domains/cookbook/foods';
import { NUTRIENTS } from '$domains/cookbook/foods/constants/nutrients';
import { OFF_TO_INFOODS } from './openfoodfacts-nutrient-mapping';
import { sortNutrientsByValue } from '$domains/cookbook/foods/utils';

/**
 * Convert OpenFoodFacts nutriments to domain NutrientValue array
 */
function mapNutrimentsToNutrients(
	nutriments: Record<string, number | string | undefined> | undefined
): NutrientValue[] {
	if (!nutriments) return [];

	const nutrients: NutrientValue[] = [];

	for (const [offKey, value] of Object.entries(nutriments)) {
		const infoodsCode = OFF_TO_INFOODS[offKey];
		if (!infoodsCode) continue;

		const nutrientDef = NUTRIENTS[infoodsCode];
		if (!nutrientDef) continue;

		if (typeof value !== 'number' || value < 0) continue;

		nutrients.push({
			nutrient: {
				code: infoodsCode,
				name_pl: nutrientDef.name_pl,
				name_en: nutrientDef.name_en,
				unit: nutrientDef.unit,
				category: nutrientDef.category
			},
			value
		});
	}

	return nutrients.sort(sortNutrientsByValue);
}

export function mapOFFProductV1ToFood(offProduct: OFFProductV1): Food {
	return {
		name_en: offProduct.product_name_en || offProduct.product_name || offProduct.code || 'Unknown',
		name_pl: null,
		category: offProduct.categories?.split(',')[0]?.trim() || null,
		scientificName: offProduct.generic_name_en || offProduct.generic_name || null,
		brand: offProduct.brands || null,
		imageUrl: offProduct.image_front_url || null,
		nutrients: mapNutrimentsToNutrients(offProduct.nutriments),
		source: {
			provider: 'openfoodfacts',
			externalId: offProduct.code,
			url: offProduct.url
		},
		userId: null
	};
}

/**
 * Map OpenFoodFacts Search-a-licious result to domain Food model
 */
export function mapOFFProductLiciousToFood(offProduct: OFFProductLicious): Food {
	return {
		name_en: offProduct.product_name_en || offProduct.product_name || offProduct.code || 'Unknown',
		name_pl: null,
		category: offProduct.categories?.split(',')[0]?.trim() || null,
		scientificName: null,
		brand: offProduct.brands || null,
		imageUrl: offProduct.image_front_url || null,
		nutrients: mapNutrimentsToNutrients(offProduct.nutriments),
		source: {
			provider: 'openfoodfacts',
			externalId: offProduct.code
		},
		userId: null
	};
}

/**
 * Map OpenFoodFacts product detail to domain Food model
 */
export function mapOFFProductDetailToFood(offProduct: OFFProductDetail): Food {
	return {
		name_en: offProduct.product_name_en || offProduct.product_name || offProduct.code || 'Unknown',
		name_pl: null,
		category: offProduct.categories?.split(',')[0]?.trim() || null,
		scientificName: offProduct.generic_name_en || offProduct.generic_name || null,
		brand: offProduct.brands || null,
		imageUrl: offProduct.image_front_url || null,
		nutrients: mapNutrimentsToNutrients(offProduct.nutriments),
		source: {
			provider: 'openfoodfacts',
			externalId: offProduct.code,
			url: offProduct.url
		},
		userId: null
	};
}
