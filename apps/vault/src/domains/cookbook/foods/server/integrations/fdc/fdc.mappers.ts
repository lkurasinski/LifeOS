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
import { NUTRIENTS } from '$domains/cookbook/foods/constants/nutrients';
import { FDC_TO_INFOODS } from '$domains/cookbook/foods/server/integrations/fdc/fdc-nutrient-mapping';
import type { Food, NutrientValue } from '$domains/cookbook/foods';

/**
 * Convert nutrient value to grams for comparison
 * This allows sorting nutrients with different units (g, mg, µg, etc.)
 */
function convertToGrams(value: number, unit: string): number {
	const unitLower = unit.toLowerCase().trim();

	switch (unitLower) {
		case 'g':
			return value;
		case 'mg':
			return value / 1000;
		case 'µg':
		case 'mcg':
		case 'ug':
			return value / 1000000;
		case 'kg':
			return value * 1000;
		case 'kcal':
			return value / 1000;
		case 'kj':
			return value / 4184;
		default:
			return value;
	}
}

/**
 * Sort nutrients by their normalized value (converted to common unit)
 * This ensures proper sorting across different units
 */
function sortNutrientsByValue(a: NutrientValue, b: NutrientValue): number {
	const aInGrams = convertToGrams(a.value, a.nutrient.unit);
	const bInGrams = convertToGrams(b.value, b.nutrient.unit);
	return bInGrams - aInGrams;
}

/**
 * Map FDC search result to domain Food model
 */
export function mapFDCSearchResultToFood(fdcFood: FDC_SearchResultFood): Food {
	return {
		// No id yet - not saved to DB
		name_en: fdcFood.description,
		name_pl: null,
		scientificName: fdcFood.scientificName || null,
		brand: fdcFood.brandOwner || null,
		nutrients: fdcFood.foodNutrients
			?.map((fdcNutrient) => {
				//@ts-ignore: fdcNutrient.nutrientId -> error in generation schema
				const infoodsCode = FDC_TO_INFOODS[fdcNutrient.nutrientId || 0];
				if (!infoodsCode) return undefined;
				const nutrientDef = NUTRIENTS[infoodsCode];
				if (!nutrientDef) return undefined;
				console.log(nutrientDef);
				return {
					nutrient: {
						code: infoodsCode,
						name_pl: nutrientDef.name_pl,
						name_en: nutrientDef.name_en,
						unit: nutrientDef.unit,
						category: nutrientDef.category
					},
					value:
						//@ts-ignore: fdcNutrient.value -> error in generation schema
						fdcNutrient && fdcNutrient.amount && fdcNutrient.value < 0 ? 0 : fdcNutrient.value || 0 //in some products amount of nutrient can be negative
				};
			})
			.filter((el) => el !== undefined),
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

			return {
				nutrient: {
					code: infoodsCode,
					name_pl: nutrientDef.name_pl,
					name_en: nutrientDef.name_en,
					unit: nutrientDef.unit,
					category: nutrientDef.category
				},
				value:
					fdcNutrient && fdcNutrient.amount && fdcNutrient.amount < 0 ? 0 : fdcNutrient.amount || 0 //in some products amount of nutrient can be negative
			};
		})
		.filter((n: NutrientValue | null): n is NonNullable<typeof n> => n !== null)
		.sort(sortNutrientsByValue);

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
