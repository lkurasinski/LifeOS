/**
 * Food Sources Service
 *
 * Provides a unified interface to search and retrieve food data from all sources.
 * Uses the Strategy Pattern to support multiple providers (internal, FDC, OpenFoodFacts, etc.).
 */

import type { FoodSourceStrategy } from './types';
import { TypesenseStrategy } from '$domains/cookbook/foods/server/integrations/typesense/typesense.strategy';
import { FDCStrategy } from '$domains/cookbook/foods/server/integrations/fdc/fdc-strategy';

// Strategy registry
const strategies: Map<string, FoodSourceStrategy> = new Map<string, FoodSourceStrategy>([
	['internal', new TypesenseStrategy()],
	['fdc', new FDCStrategy()]
	// Add more strategies here:
	// ['openfoodfacts', new OpenFoodFactsStrategy()]
]);

/**
 * Get strategy for a given source
 */
export function getStrategy(source: string): FoodSourceStrategy {
	const strategy = strategies.get(source);

	if (!strategy) {
		throw new Error(
			`Unknown external food source: ${source}. Available: ${Array.from(strategies.keys()).join(', ')}`
		);
	}

	return strategy;
}

/**
 * Get list of available sources
 */
export function getAvailableSources(): string[] {
	return Array.from(strategies.keys());
}

// Re-export types
export type { FoodSourceStrategy } from './types';
