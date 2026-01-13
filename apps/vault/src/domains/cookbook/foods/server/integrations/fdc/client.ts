import { FDC_API_KEY } from '$env/static/private';
import { createClient, createConfig } from './generated/client';
import { getFood, postFoodsSearch } from './generated/sdk.gen';
import type {
	SearchResult,
	BrandedFoodItem,
	FoundationFoodItem,
	SrLegacyFoodItem,
	SurveyFoodItem,
	SampleFoodItem,
	GetFoodsSearchData
} from './generated/types.gen';
import { loggedFetch } from '$lib/server/logger/logged-fetch';

// Custom fetch wrapper for FDC API with logging
const fdcFetch: typeof fetch = (input, init) => {
	return loggedFetch(input as string | Request, {
		...init,
		serviceName: 'FDC'
	});
};

// Create custom client with auth configured
const fdcClient = createClient(
	createConfig({
		baseUrl: 'https://api.nal.usda.gov/fdc',
		auth: FDC_API_KEY,
		fetch: fdcFetch,
		headers: {
			'Content-Type': 'application/json'
		},
		querySerializer: {
			array: {
				style: 'form',
				explode: true
			}
		}
	})
);

/**
 * Search foods in FoodData Central
 */
export async function searchFoods(params: {
	query: string;
	dataType?: string;
	pageSize?: number;
	pageNumber?: number;
	sortBy?: 'dataType.keyword' | 'lowercaseDescription.keyword' | 'fdcId' | 'publishedDate';
	sortOrder?: 'asc' | 'desc';
}): Promise<SearchResult> {
	const { data, error } = await postFoodsSearch({
		client: fdcClient,
		//@ts-ignore: there is an error in generated interfaces
		query: {
			api_key: FDC_API_KEY
		},
		body: {
			query: params.query,
			dataType: [params.dataType] as GetFoodsSearchData['query']['dataType']
		}
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
		client: fdcClient,
		auth: FDC_API_KEY,
		path: {
			fdcId: fdcId.toString()
		},
		query: {
			format: 'full'
		}
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
