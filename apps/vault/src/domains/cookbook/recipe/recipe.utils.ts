/**
 * Domain utilities for Recipes
 */

import type { RecipeSearchResult } from './server/integrations/typesense/recipe.typesense.schema';

/**
 * Format basic nutrients for display (per serving)
 * Returns a string like: "energy: 450 kcal · carbs: 50 g · prot: 25 g · fat: 15 g"
 */
export function getBasicRecipeNutrientsString(recipe: RecipeSearchResult): string {
	const parts: string[] = [];

	if (recipe.energyKcalPerServing != null) {
		parts.push(`energy: ${Math.round(recipe.energyKcalPerServing)} kcal`);
	}

	if (recipe.carbsPerServing != null) {
		parts.push(`carbs: ${Math.round(recipe.carbsPerServing)} g`);
	}

	if (recipe.proteinPerServing != null) {
		parts.push(`prot: ${Math.round(recipe.proteinPerServing)} g`);
	}

	if (recipe.fatPerServing != null) {
		parts.push(`fat: ${Math.round(recipe.fatPerServing)} g`);
	}

	if (parts.length === 0) {
		return '';
	}

	return parts.join(' · ');
}

/**
 * Check if recipe has nutrition data
 */
export function hasNutritionData(recipe: RecipeSearchResult): boolean {
	return (
		recipe.energyKcalPerServing != null ||
		recipe.proteinPerServing != null ||
		recipe.fatPerServing != null ||
		recipe.carbsPerServing != null ||
		recipe.fiberPerServing != null
	);
}