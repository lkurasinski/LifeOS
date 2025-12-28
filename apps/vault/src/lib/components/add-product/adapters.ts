/**
 * Adapters to convert source-specific data to common interfaces
 */

import type { SearchResultFood, FDCFoodDetail } from '$lib/integrations/fdc/client';
import type { CommonFoodSearchResult, CommonFoodDetail } from './types';
import { mapFDCSearchResult, mapFDCFoodDetail } from '$lib/integrations/fdc/mappers';

/**
 * Convert FDC search result to common format
 */
export function fdcToCommon(fdcResult: SearchResultFood): CommonFoodSearchResult {
	return mapFDCSearchResult(fdcResult);
}

/**
 * Convert FDC food detail to common format
 */
export function fdcDetailToCommon(fdcFood: FDCFoodDetail): CommonFoodDetail {
	return mapFDCFoodDetail(fdcFood);
}

/**
 * Convert OpenFoodFacts search result to common format
 * TODO: Implement when OFF integration is added
 */
export function offToCommon(offResult: any): CommonFoodSearchResult {
	return {
		sourceId: offResult.code,
		source: 'openfoodfacts',
		name: offResult.product_name,
		description: offResult.brands,
		category: offResult.categories,
		brand: offResult.brands,
		metadata: {}
	};
}

/**
 * Convert OpenFoodFacts detail to common format
 * TODO: Implement when OFF integration is added
 */
export function offDetailToCommon(offFood: any): CommonFoodDetail {
	return {
		sourceId: offFood.code,
		source: 'openfoodfacts',
		name: offFood.product_name,
		category: offFood.categories,
		brand: offFood.brands,
		nutrients: [],
		metadata: {}
	};
}
