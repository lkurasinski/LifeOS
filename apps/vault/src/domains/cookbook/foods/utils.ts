/**
 * Domain utilities for Foods
 */

import type { Food, NutrientValue } from './foods.schema';
import { NUTRIENTS } from '$domains/cookbook/foods/constants/nutrients';

/**
 * Build source URL based on provider and external ID
 */
export function buildSourceUrl(
	provider: string | undefined,
	externalId: string | number | undefined
): string | null {
	if (!provider || !externalId) return null;

	switch (provider) {
		case 'fdc':
			return `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${externalId}/nutrients`;
		case 'openfoodfacts':
			// Future: return OpenFoodFacts URL
			return null;
		default:
			return null;
	}
}

/**
 * Type guard: Check if food is saved in database
 */
export function isSavedFood(
	food: Food
): food is Food & { id: string; createdAt: Date; updatedAt: Date } {
	return food.id !== undefined && food.createdAt !== undefined && food.updatedAt !== undefined;
}

/**
 * Type guard: Check if food is from external source
 */
export function isFromExternalSource(
	food: Food
): food is Food & { source: NonNullable<Food['source']> } {
	return food.source !== null && food.source !== undefined;
}

/**
 * Check if food has a specific nutrient
 */
export function hasNutrient(food: Food, nutrientCode: string): boolean {
	return !food.nutrients ? false : food.nutrients.some((nv) => nv.nutrient.code === nutrientCode);
}

/**
 * Get nutrient value by code
 */
export function getNutrientValue(food: Food, nutrientCode: string): number | undefined {
	return food.nutrients?.find((nv) => nv.nutrient.code === nutrientCode)?.value;
}

/**
 * Get nutrient by code
 */
export function getNutrient(food: Food, nutrientCode: string): NutrientValue | undefined {
	return food.nutrients?.find((nv) => nv.nutrient.code === nutrientCode);
}

/**
 * Group nutrients by category
 */
export function groupNutrientsByCategory(
	nutrients: NutrientValue[]
): Record<string, NutrientValue[]> {
	return nutrients.reduce(
		(acc, nv) => {
			const category = nv.nutrient.category || 'Other';
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(nv);
			return acc;
		},
		{} as Record<string, NutrientValue[]>
	);
}

export const getBasicNutrientsString = (food: Food) => {
	return `energy: ${
		food.nutrients?.find((el) => el.nutrient.code === NUTRIENTS.ENERC_ASF_kcal.code)?.value ||
		food.nutrients?.find((el) => el.nutrient.code === NUTRIENTS.ENERC_AGF_kcal.code)?.value ||
		food.nutrients?.find((el) => el.nutrient.code === NUTRIENTS.ENERA_kcal.code)?.value
	} kcal · carbs: ${
		food.nutrients?.find((el) => el.nutrient.code === NUTRIENTS.CHOCDF_g.code)?.value
	} g · prot ${
		food.nutrients?.find((el) => el.nutrient.code === NUTRIENTS.PROTCNT_g.code)?.value
	} g · fat ${food.nutrients?.find((el) => el.nutrient.code === NUTRIENTS.FAT_g.code)?.value} g`;
};
