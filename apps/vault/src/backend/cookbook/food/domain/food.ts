import type { Food, FoodNutrientAmount } from '$backend/cookbook/food/domain/food.types';
import { NUTRIENTS } from '$backend/cookbook/common/nutrient/nutrient';
import { convertToGrams } from '$backend/common/convertToGrams';

/**
 * Type guard: Check if food is saved in database
 */
export function isSavedFood(
	food: Food
): food is Food & { id: string; createdAt: Date; updatedAt: Date } {
	return food.id !== undefined && food.createdAt !== undefined && food.updatedAt !== undefined;
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
export function getFoodNutrientAmount(food: Food, nutrientCode: string): number | undefined {
	return food.nutrients?.find((nv) => nv.nutrient.code === nutrientCode)?.amount;
}

/**
 * Get nutrient by code
 */
export function getFoodNutrient(food: Food, nutrientCode: string): FoodNutrientAmount | undefined {
	return food.nutrients?.find((nv) => nv.nutrient.code === nutrientCode);
}

export const getEnergyKcal = (food: Food): number => {
	return (
		getFoodNutrientAmount(food, NUTRIENTS.ENERC_ASF_kcal.code) ??
		getFoodNutrientAmount(food, NUTRIENTS.ENERC_AGF_kcal.code) ??
		getFoodNutrientAmount(food, NUTRIENTS.ENERA_kcal.code) ??
		0
	);
};

/**
 * Sort nutrients by their normalized value (converted to common unit)
 * This ensures proper sorting across different units
 */
export function sortNutrientsByAmount(a: FoodNutrientAmount, b: FoodNutrientAmount): number {
	const aInGrams = convertToGrams(a.amount, a.nutrient.unit);
	const bInGrams = convertToGrams(b.amount, b.nutrient.unit);
	return bInGrams - aInGrams;
}

export const SKIPPED_NUTRIENTS = [
	NUTRIENTS.ASH_g.code,
	NUTRIENTS.WATER_g.code,
	NUTRIENTS.NT_g.code
];
