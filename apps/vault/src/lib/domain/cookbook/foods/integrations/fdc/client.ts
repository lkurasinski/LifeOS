import { FDC_API_KEY } from '$env/static/private';
import { client } from './generated/client.gen';
import { getFood, getFoodsSearch } from './generated/sdk.gen';
import type {
	SearchResult,
	BrandedFoodItem,
	FoundationFoodItem,
	SrLegacyFoodItem,
	SurveyFoodItem,
	SampleFoodItem
} from './generated/types.gen';

// Configure client
client.setConfig({
	headers: {
		'Content-Type': 'application/json'
	},
	querySerializer: {
		array: {
			style: 'form',
			explode: true
		}
	}
});

/**
 * Helper to merge API key with query params
 */
function withApiKey<T extends Record<string, unknown>>(query: T): T & { api_key: string } {
	return {
		...query,
		api_key: FDC_API_KEY
	};
}

/**
 * Search foods in FoodData Central
 */
export async function searchFoods(params: {
	query: string;
	dataType?: string[];
	pageSize?: number;
	pageNumber?: number;
	sortBy?: 'dataType.keyword' | 'lowercaseDescription.keyword' | 'fdcId' | 'publishedDate';
	sortOrder?: 'asc' | 'desc';
}): Promise<SearchResult> {
	console.log(params);
	const { data, error } = await getFoodsSearch({
		query: withApiKey({
			query: params.query,
			dataType: params.dataType as Array<'Branded' | 'Foundation' | 'Survey (FNDDS)' | 'SR Legacy'>
			// pageSize: params.pageSize,
			// pageNumber: params.pageNumber
			// sortBy: params.sortBy,
			// sortOrder: params.sortOrder
		})
	});

	if (error) {
		throw new Error(`FDC API error: ${JSON.stringify(error)}`);
	}

	return data as SearchResult;
}

/**
 * Food detail types union
 */
export type FDCFoodDetail =
	| BrandedFoodItem
	| FoundationFoodItem
	| SrLegacyFoodItem
	| SurveyFoodItem
	| SampleFoodItem;

/**
 * Get detailed food information from FoodData Central
 */
export async function getFoodDetail(fdcId: number): Promise<FDCFoodDetail> {
	const { data, error } = await getFood({
		path: {
			fdcId: fdcId.toString()
		},
		query: withApiKey({
			format: 'full'
		})
	});

	if (error) {
		throw new Error(`FDC API error: ${JSON.stringify(error)}`);
	}

	return data as FDCFoodDetail;
}

// Re-export generated types for convenience
export type {
	SearchResult,
	SearchResultFood,
	BrandedFoodItem,
	FoundationFoodItem,
	SrLegacyFoodItem,
	SurveyFoodItem,
	SampleFoodItem,
	FoodNutrient,
	Nutrient
} from './generated/types.gen';
