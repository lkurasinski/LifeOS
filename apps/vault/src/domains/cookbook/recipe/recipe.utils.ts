/**
 * Domain utilities for Recipes
 */

import type { TypesenseRecipeDocument } from './server/integrations/typesense/recipe.typesense.schema';

/**
 * Format basic nutrients for display (per serving)
 * Returns a string like: "energy: 450 kcal · carbs: 50 g · prot: 25 g · fat: 15 g"
 */
export function getBasicRecipeNutrientsString(recipe: TypesenseRecipeDocument): string {
	const parts: string[] = [];

	if (recipe.energy_kcal_per_serving != null) {
		parts.push(`energy: ${Math.round(recipe.energy_kcal_per_serving)} kcal`);
	}

	if (recipe.carbs_per_serving != null) {
		parts.push(`carbs: ${Math.round(recipe.carbs_per_serving)} g`);
	}

	if (recipe.protein_per_serving != null) {
		parts.push(`prot: ${Math.round(recipe.protein_per_serving)} g`);
	}

	if (recipe.fat_per_serving != null) {
		parts.push(`fat: ${Math.round(recipe.fat_per_serving)} g`);
	}

	if (parts.length === 0) {
		return '';
	}

	return parts.join(' · ');
}

/**
 * Check if recipe has nutrition data
 */
export function hasNutritionData(recipe: TypesenseRecipeDocument): boolean {
	return (
		recipe.energy_kcal_per_serving != null ||
		recipe.protein_per_serving != null ||
		recipe.fat_per_serving != null ||
		recipe.carbs_per_serving != null ||
		recipe.fiber_per_serving != null
	);
}
