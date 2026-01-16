/**
 * Mappers to convert FDC API types to Domain Models
 *
 * These mappers are used at the integration boundary to transform
 * external FDC types into our canonical domain Food models.
 */

import type {
	FDCFoodDetail as FDC_FDCFoodDetail,
	FoodNutrient as FDC_FoodNutrient,
	SearchResultFood as FDC_SearchResultFood
} from './client';
import { NUTRIENTS } from '$domains/cookbook/foods/constants/nutrients';
import { FDC_TO_INFOODS } from '$domains/cookbook/foods/server/integrations/fdc/fdc-nutrient-mapping';
import type { Food, NutrientValue } from '$domains/cookbook/foods';
import { sortNutrientsByValue } from '$domains/cookbook/foods/utils';

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
		imageUrl: null,
		nutrients: fdcFood.foodNutrients
			?.map((fdcNutrient) => {
				//@ts-ignore: fdcNutrient.nutrientId -> error in generation schema
				const infoodsCode = FDC_TO_INFOODS[fdcNutrient.nutrientId || 0];
				if (!infoodsCode) return undefined;
				const nutrientDef = NUTRIENTS[infoodsCode];
				if (!nutrientDef) return undefined;
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
			.filter((el) => el !== undefined)
			.sort(sortNutrientsByValue),
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
		imageUrl: null,
		nutrients,
		source: {
			provider: 'fdc',
			externalId: fdcFood.fdcId
		},
		userId: null
		// No createdAt/updatedAt - not saved yet
	};
}
