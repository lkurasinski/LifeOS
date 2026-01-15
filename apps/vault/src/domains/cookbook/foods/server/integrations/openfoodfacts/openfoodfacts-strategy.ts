/**
 * OpenFoodFacts Strategy Implementation
 *
 * Implements the FoodSourceStrategy for OpenFoodFacts.
 * Supports both API v1 and Search-a-licious (beta) endpoints.
 */

import type { Food, FoodSearchParams, FoodSearchResults } from '$domains/cookbook/foods';
import {
	searchFoodsV1,
	searchFoodsLicious,
	getProductDetail
} from './client';
import {
	mapOFFProductV1ToFood,
	mapOFFProductLiciousToFood,
	mapOFFProductDetailToFood
} from './openfoodfacts.mappers';
import type { FoodSourceStrategy } from '../../services/food-sources';

export class OpenFoodFactsStrategy implements FoodSourceStrategy {
	readonly name = 'openfoodfacts' as const;

	async search(params: FoodSearchParams): Promise<FoodSearchResults> {
		const apiVersion = params.apiVersion || 'licious'; // Default to Search-a-licious

		if (apiVersion === 'v1') {
			return this.searchWithV1(params);
		} else {
			return this.searchWithLicious(params);
		}
	}

	/**
	 * Search using API v1
	 */
	private async searchWithV1(params: FoodSearchParams): Promise<FoodSearchResults> {
		const offResult = await searchFoodsV1({
			query: params.query,
			pageSize: params.pageSize || 25,
			pageNumber: params.pageNumber || 1
		});

		const foods = offResult.products.map(mapOFFProductV1ToFood);

		return {
			items: foods,
			total: offResult.count || 0,
			page: offResult.page || 1,
			pageSize: params.pageSize || 25,
			totalPages: offResult.page_count || 0
		};
	}

	/**
	 * Search using Search-a-licious (beta)
	 */
	private async searchWithLicious(params: FoodSearchParams): Promise<FoodSearchResults> {
		const offResult = await searchFoodsLicious({
			query: params.query,
			pageSize: params.pageSize || 25,
			pageNumber: params.pageNumber || 1
		});

		const foods = offResult.hits.map(mapOFFProductLiciousToFood);

		return {
			items: foods,
			total: offResult.count || 0,
			page: offResult.page || 1,
			pageSize: params.pageSize || 25,
			totalPages: offResult.page_count || 0
		};
	}

	async getById(sourceId: string | number): Promise<Food> {
		const barcode = typeof sourceId === 'number' ? sourceId.toString() : sourceId;
		const offResponse = await getProductDetail(barcode);
		return mapOFFProductDetailToFood(offResponse.product);
	}
}
