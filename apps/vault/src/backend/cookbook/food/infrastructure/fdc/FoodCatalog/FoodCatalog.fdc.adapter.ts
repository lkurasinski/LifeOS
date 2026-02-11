import type { FoodCatalogPort } from '$backend/cookbook/food/domain/ports/FoodCatalog.port';
import type { Food, FoodId, FoodSearchResults } from '$backend/cookbook/food/domain/food.types';
import type { FoodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';
import type { FoodSearchQuery } from '$backend/cookbook/food/application/handleSearchFood.query';
import { loggedFetch } from '$lib/server/logger/logged-fetch';
import { FDC_API_KEY } from '$env/static/private';
import {
	type BrandedFoodItem,
	type FoundationFoodItem,
	getFood,
	type GetFoodsSearchData,
	postFoodsSearch,
	type SearchResult as SearchResult_FDC,
	type SrLegacyFoodItem
} from '$backend/cookbook/food/infrastructure/fdc/FoodCatalog/generated';
import {
	mapFDCFoodDetailToFood,
	mapFDCSearchResultFoodToFood
} from '$backend/cookbook/food/infrastructure/fdc/FoodCatalog/FoodCatalog.fdc.mapper';
import type { Client } from './generated/client';
import { createClient, createConfig } from './generated/client';
import { handleApiResponse } from '$backend/common/utils/api.utils';

export class FdcFoodCatalogAdapter implements FoodCatalogPort {
	readonly defaultPageSize = 25;
	readonly defaultPageNumber = 1;
	private fdcClient: Client;

	constructor() {
		this.fdcClient = createClient(
			createConfig({
				baseUrl: 'https://api.nal.usda.gov/fdc',
				auth: FDC_API_KEY,
				fetch: this.fetch.bind(this),
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
	}

	async search(query: FoodSearchQuery): Promise<FoodSearchResults> {
		const { data, error } = await postFoodsSearch({
			client: this.fdcClient,
			//@ts-ignore: there is an error in generated interfaces - api_key
			query: {
				api_key: FDC_API_KEY
			},
			body: {
				query: query.text,
				dataType: [query.dataType] as GetFoodsSearchData['query']['dataType'],
				pageNumber: query.page || this.defaultPageNumber,
				pageSize: query.size || this.defaultPageSize,
				sortBy: 'fdcId'
			}
		});

		if (error) {
			throw new Error(`FDC API error: ${JSON.stringify(error)}`);
		}

		//another schema error - says it's an array, but it isn't
		const response: SearchResult_FDC = data as SearchResult_FDC;

		return {
			items: response?.foods?.map(mapFDCSearchResultFoodToFood) || [],
			total: response.totalHits || 0,
			page: response.currentPage || 0,
			size: response.foods?.length ?? 0
		};
	}

	async getById(id: FoodId): Promise<Food | undefined> {
		const response = await getFood({
			client: this.fdcClient,
			auth: FDC_API_KEY,
			path: {
				fdcId: id.toString()
			},
			query: {
				format: 'full'
			}
		});

		const data = handleApiResponse(response, {
			serviceName: 'FDC',
			notFoundReturnsNull: false,
			resourceId: id.toString()
		});

		return mapFDCFoodDetailToFood(data as BrandedFoodItem | FoundationFoodItem | SrLegacyFoodItem);
	}

	private async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
		return loggedFetch(input as string | Request, {
			...init,
			serviceName: 'FDC'
		});
	}
}
