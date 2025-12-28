/**
 * External Food Source Strategy Interface
 *
 * Defines the contract that all external food source integrations must implement.
 * This enables the Strategy Pattern for swappable food data providers.
 */

import type { Food, FoodSearchResults, FoodSearchParams } from '$lib/domain/cookbook/foods';

/**
 * Search parameters for external food sources
 */

/**
 * Food Source Strategy
 * Each integration (internal database, FDC, OpenFoodFacts, etc.) implements this interface
 */
export interface FoodSourceStrategy {
	/** Strategy name/identifier */
	readonly name: 'internal' | 'fdc' | 'openfoodfacts';

	/**
	 * Search foods by text query
	 */
	search(params: FoodSearchParams): Promise<FoodSearchResults>;

	/**
	 * Get food by external source ID
	 */
	getById(sourceId: string | number): Promise<Food>;
}
