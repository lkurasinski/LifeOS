/**
 * FoodData Central (FDC) Strategy Implementation
 *
 * Implements the ExternalFoodSourceStrategy for USDA FoodData Central.
 * Encapsulates all FDC-specific logic in one place.
 */

import type { Food, FoodSearchParams, FoodSearchResults } from '$lib/domain/cookbook/foods';
import { getFoodDetail, searchFoods } from '$lib/domain/cookbook/foods/integrations/fdc/client';
import {
	mapFDCFoodDetailToFood,
	mapFDCSearchResultToFood
} from '$lib/domain/cookbook/foods/integrations/fdc/mappers';
import type { FoodSourceStrategy } from '$lib/services/food-sources';

export class FDCStrategy implements FoodSourceStrategy {
	readonly name = 'fdc' as const;

	async search(params: FoodSearchParams): Promise<FoodSearchResults> {
		const dataType = ['Survey (FNDDS)'];
		const sortBy =
			(params.sortBy as
				| 'dataType.keyword'
				| 'lowercaseDescription.keyword'
				| 'fdcId'
				| 'publishedDate') || 'dataType.keyword';
		const sortOrder = (params.sortOrder as 'asc' | 'desc') || 'asc';

		const fdcResult = await searchFoods({
			query: params.query,
			dataType,
			pageSize: params.pageSize || 25,
			pageNumber: params.pageNumber || 1,
			sortBy,
			sortOrder
		});

		const foods = (fdcResult.foods || []).map(mapFDCSearchResultToFood);

		return {
			items: foods,
			total: fdcResult.totalHits || 0,
			page: fdcResult.currentPage || 0,
			totalPages: fdcResult.totalPages || 0,
			pageSize: params.pageSize || 0 //@TODO should not be taken from params
		};
	}

	async getById(sourceId: string | number): Promise<Food> {
		const fdcId = typeof sourceId === 'string' ? Number(sourceId) : sourceId;
		const fdcFood = await getFoodDetail(fdcId);
		return mapFDCFoodDetailToFood(fdcFood);
	}
}
