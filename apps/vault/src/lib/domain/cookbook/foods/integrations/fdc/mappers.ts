/**
 * Mappers to convert FDC API types to Domain Models
 *
 * These mappers are used at the integration boundary to transform
 * external FDC types into our canonical domain Food models.
 */

import type {
	SearchResultFood as FDC_SearchResultFood,
	FDCFoodDetail as FDC_FDCFoodDetail,
	FoodNutrient as FDC_FoodNutrient
} from './client';
import { NUTRIENTS } from '$lib/constants/nutrients';
import { FDC_TO_INFOODS } from '$lib/domain/cookbook/foods/integrations/fdc/fdc-nutrient-mapping';
import type { Food, NutrientValue } from '$lib/domain/cookbook/foods';

/**
 * Map FDC search result to common format
 */
export function mapFDCSearchResult(fdcFood: FDC_SearchResultFood) {
	return {
		sourceId: fdcFood.fdcId,
		source: 'fdc' as const,
		name: fdcFood.description,
		category: undefined, // SearchResultFood doesn't include category info
		metadata: {
			dataType: fdcFood.dataType,
			score: (fdcFood as any).score // score is not in the type but may exist
		}
	};
}

/**
 * Map FDC food detail to common format with nutrients
 */
export function mapFDCFoodDetail(fdcFood: FDC_FDCFoodDetail) {
	const nutrients = ((fdcFood as any).foodNutrients || [])
		.map((nutrient: FDC_FoodNutrient) => {
			const infoodsCode = FDC_TO_INFOODS[nutrient.id];
			if (!infoodsCode) return null;

			return {
				code: infoodsCode,
				value: nutrient.amount || 0,
				unit: nutrient.nutrient?.unitName || 'g'
			};
		})
		.filter((n): n is { code: string; value: number; unit: string } => n !== null);

	// Extract category - different types have different fields
	let category: string | undefined;
	if ('foodCategory' in fdcFood && fdcFood.foodCategory) {
		category =
			typeof fdcFood.foodCategory === 'string'
				? fdcFood.foodCategory
				: fdcFood.foodCategory.description;
	} else if ('brandedFoodCategory' in fdcFood && fdcFood.brandedFoodCategory) {
		category = fdcFood.brandedFoodCategory;
	}

	return {
		sourceId: fdcFood.fdcId,
		source: 'fdc' as const,
		name: fdcFood.description,
		category,
		scientificName: 'scientificName' in fdcFood ? fdcFood.scientificName : undefined,
		brand: 'brandOwner' in fdcFood ? fdcFood.brandOwner : undefined,
		nutrients,
		metadata: {
			dataType: (fdcFood as any).dataType,
			publicationDate: (fdcFood as any).publicationDate
		}
	};
}

/**
 * Map FDC nutrients to database format for creation
 */
export function mapFDCNutrientsForDB(fdcNutrients: FDC_FoodNutrient[]) {
	return fdcNutrients
		.map((nutrient) => {
			const infoodsCode = FDC_TO_INFOODS[nutrient.id];
			if (!infoodsCode) return null;

			return {
				code: infoodsCode,
				value: nutrient.amount || 0
			};
		})
		.filter((n): n is { code: string; value: number } => n !== null);
}

// ============================================================================
// NEW DOMAIN MODEL MAPPERS
// ============================================================================

/**
 * Map FDC search result to domain Food model
 */
export function mapFDCSearchResultToFood(fdcFood: FDC_SearchResultFood): Food {
	return {
		// No id yet - not saved to DB
		name_en: fdcFood.description,
		name_pl: null,
		category: null, // SearchResultFood doesn't include category
		scientificName: fdcFood.scientificName || null,
		brand: fdcFood.brandOwner || null,
		nutrients: [], // Search results don't include full nutrients
		source: {
			provider: 'fdc',
			externalId: fdcFood.fdcId
		},
		userId: null
		// No createdAt/updatedAt - not saved yet
	};
}

/**
 * Map FDC food detail to domain Food model
 */
export function mapFDCFoodDetailToFood(fdcFood: FDC_FDCFoodDetail): Food {
	// Map FDC nutrients to domain NutrientValue objects
	const nutrients: NutrientValue[] = ((fdcFood as any).foodNutrients || [])
		.map((fdcNutrient: FDC_FoodNutrient): NutrientValue | null => {
			const infoodsCode = FDC_TO_INFOODS[fdcNutrient.nutrient?.id || 0];
			if (!infoodsCode) return null;
			const nutrientDef = NUTRIENTS[infoodsCode];
			if (!nutrientDef) return null;
			console.log(nutrientDef);
			return {
				nutrient: {
					code: infoodsCode,
					name_pl: nutrientDef.name_pl,
					name_en: nutrientDef.name_en,
					unit: nutrientDef.unit,
					category: nutrientDef.category
				},
				value: fdcNutrient.amount || 0
			};
		})
		.filter((n: NutrientValue | null): n is NonNullable<typeof n> => n !== null);

	// Extract category - different FDC food types have different fields
	let category: string | null = null;
	if ('foodCategory' in fdcFood && fdcFood.foodCategory) {
		category =
			typeof fdcFood.foodCategory === 'string'
				? fdcFood.foodCategory
				: fdcFood.foodCategory.description || null;
	} else if ('brandedFoodCategory' in fdcFood && fdcFood.brandedFoodCategory) {
		category = fdcFood.brandedFoodCategory;
	}

	return {
		// No id yet - not saved to DB
		name_en: fdcFood.description,
		name_pl: null,
		category,
		scientificName: ('scientificName' in fdcFood ? fdcFood.scientificName : null) || null,
		brand: ('brandOwner' in fdcFood ? fdcFood.brandOwner : undefined) || null,
		nutrients,
		source: {
			provider: 'fdc',
			externalId: fdcFood.fdcId
		},
		userId: null
		// No createdAt/updatedAt - not saved yet
	};
}
