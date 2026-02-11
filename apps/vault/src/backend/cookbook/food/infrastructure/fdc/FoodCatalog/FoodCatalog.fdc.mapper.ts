/**
 * Mappers to convert FDC API types to Domain Models
 */

import type {
	AbridgedFoodItem,
	AbridgedFoodNutrient,
	BrandedFoodItem,
	FoodNutrient,
	FoundationFoodItem,
	GetFoodResponses,
	SearchResultFood as FDC_SearchResultFood,
	SrLegacyFoodItem
} from '$backend/cookbook/food/infrastructure/fdc/FoodCatalog/generated';
import type { Food, FoodNutrientAmount, Nutrient } from '$backend/cookbook/food/domain/food.types';
import { NUTRIENTS } from '$backend/cookbook/common/nutrient/nutrient';
import { sortNutrientsByAmount } from '$backend/cookbook/food/domain/food';
import { FDC_TO_INFOODS } from '$backend/cookbook/food/infrastructure/fdc/FoodCatalog/fdc-nutrient-mapping';

/**
 * Map FDC search result to dto Food model
 */
export function mapFDCSearchResultFoodToFood(fdcFood: FDC_SearchResultFood): Food {
	return {
		category: undefined,
		name: {
			en: fdcFood.description,
			pl: undefined
		},
		scientificName: fdcFood.scientificName || undefined,
		brand: fdcFood.brandOwner || undefined,
		imageUrl: undefined,
		nutrients: fdcFood.foodNutrients
			? fdcFood.foodNutrients
					.map((fdcNutrient) => {
						//@ts-ignore: fdcNutrient.nutrientId -> error in generation schema
						const infoodsCode = FDC_TO_INFOODS[fdcNutrient.nutrientId || 0];
						if (!infoodsCode) return undefined;
						const nutrientDef = NUTRIENTS[infoodsCode];
						if (!nutrientDef) return undefined;

						return {
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
							amount:
								//@ts-ignore: fdcNutrient.value -> error in generation schema
								fdcNutrient && fdcNutrient.value && fdcNutrient.value < 0
									? 0
									: //@ts-ignore: fdcNutrient.value -> error in generation schema
										fdcNutrient.value || 0 //in some products amount of nutrient can be negative
						};
					})
					.filter((el) => el !== undefined)
					.sort(sortNutrientsByAmount)
			: [],
		source: {
			provider: 'fdc',
			externalId: `${fdcFood.fdcId}`
		}
	};
}
/**
 * Map FDC food detail to domain Food model
 */
export function mapFDCFoodDetailToFood(
	fdcFood: BrandedFoodItem | FoundationFoodItem | SrLegacyFoodItem
): Food {
	const nutrients: FoodNutrientAmount[] = (fdcFood.foodNutrients || [])
		.map((fdcNutrient: FoodNutrient): FoodNutrientAmount | undefined => {
			const infoodsCode = FDC_TO_INFOODS[fdcNutrient.nutrient?.id || 0];
			if (!infoodsCode) return undefined;
			const nutrientDef = NUTRIENTS[infoodsCode];
			if (!nutrientDef) return undefined;

			return {
				nutrient: {
					code: infoodsCode,
					name: {
						pl: nutrientDef.name_pl,
						en: nutrientDef.name_en
					},
					unit: nutrientDef.unit,
					categoryId: nutrientDef.category
				},
				amount:
					fdcNutrient && fdcNutrient.amount && fdcNutrient.amount < 0 ? 0 : fdcNutrient.amount || 0 //in some products amount of nutrient can be negative
			};
		})
		.filter((el) => el !== undefined)
		.sort(sortNutrientsByAmount);

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
		name: {
			en: fdcFood.description
		},
		category: category || undefined,
		scientificName: 'scientificName' in fdcFood ? fdcFood.scientificName : undefined,
		brand: 'brandOwner' in fdcFood ? fdcFood.brandOwner : undefined,
		nutrients,
		source: {
			provider: 'fdc',
			externalId: fdcFood.fdcId.toString()
		}
		// No createdAt/updatedAt - not saved yet
	};
}
