/**
 * OpenFoodFacts API Client
 *
 * Supports both API v1 and Search-a-licious (beta) endpoints
 */

import { loggedFetch } from '$lib/server/logger/logged-fetch';
import type {
	OFFSearchResponseV1,
	OFFSearchResponseLicious,
	OFFProductDetailResponse
} from './types';
import type { FoodCatalogPort } from '$backend/cookbook/food/domain/ports/FoodCatalog.port';
import type { FoodSearchQuery } from '$backend/cookbook/food/application/handleSearchFood.query';
import type { Food, FoodId, FoodSearchResults } from '$backend/cookbook/food/domain/food.types';
import {
	mapOFFProductDetailToFood,
	mapOFFProductLiciousToFood,
	mapOFFProductV1ToFood
} from '$backend/cookbook/food/infrastructure/openfoodfacts/FoodCatalog/FoodCatalog.openfoodfacts.mappers';
import { handleApiResponse } from '$backend/common/utils/api.utils';

export class OpenFoodFactsFoodCatalogAdapter implements FoodCatalogPort {
	readonly defaultPageSize = 25;
	readonly defaultPageNumber = 1;
	readonly apiV1BaseUrl = 'https://world.openfoodfacts.org';
	readonly apiV2BaseUrl = 'https://search.openfoodfacts.org';

	async search(query: FoodSearchQuery): Promise<FoodSearchResults> {
		const {
			text = '',
			size = this.defaultPageSize,
			page = this.defaultPageNumber,
			apiVersion
		} = query;

		if (apiVersion === 'v1') {
			return this.searchApiV1({ ...query, text, size, page });
		} else {
			return this.searchApiV2({ ...query, text, size, page });
		}
	}

	async getById(id: FoodId): Promise<Food | undefined> {
		const url = `${this.apiV1BaseUrl}/api/v2/product/${id}`;

		const response = await this.fetch(url, {
			method: 'GET',
			headers: this.getHeaders()
		});

		//@ts-ignore: //@TODO that type of response or handleApiResponse is not correct. to be fixed
		const data = handleApiResponse<OFFProductDetailResponse>(response, {
			serviceName: 'FDC',
			notFoundReturnsNull: false,
			resourceId: id.toString()
		});

		return data?.product && mapOFFProductDetailToFood(data?.product);
	}

	private async searchApiV1(query: FoodSearchQuery): Promise<FoodSearchResults> {
		const url = new URL(`${this.apiV1BaseUrl}/cgi/search.pl`);
		url.searchParams.set('search_terms', query.text || '');
		url.searchParams.set('page_size', query.size.toString());
		url.searchParams.set('page', query.page.toString());
		url.searchParams.set('json', '1');
		url.searchParams.set(
			'fields',
			'code,product_name,product_name_en,generic_name,generic_name_en,brands,categories,nutriments,nutriscore_grade,nova_group,url,image_front_url,image_front_small_url'
		);

		const response = await this.fetch(url.toString(), {
			method: 'GET',
			headers: this.getHeaders()
		});

		if (!response.ok) {
			throw new Error(`OpenFoodFacts API v1 error: ${response.status} ${response.statusText}`);
		}

		const data: OFFSearchResponseV1 = await response.json();

		return {
			items: data?.products?.map(mapOFFProductV1ToFood) || [],
			total: data.count || 0,
			page: data.page || 0,
			size: data.page_size ?? 0
		};
	}

	//so called licious search
	private async searchApiV2(query: FoodSearchQuery): Promise<FoodSearchResults> {
		const url = new URL(`${this.apiV2BaseUrl}/search`);
		url.searchParams.set('q', query.text || '');
		url.searchParams.set('page_size', query.size.toString());
		url.searchParams.set('page', query.page.toString());
		url.searchParams.set(
			'fields',
			'code,product_name,product_name_en,brands,categories,nutriments,nutriscore_grade,nova_groups,image_front_url,image_front_small_url'
		);

		const response = await this.fetch(url.toString(), {
			method: 'GET',
			headers: this.getHeaders()
		});

		if (!response.ok) {
			throw new Error(`OpenFoodFacts API v1 error: ${response.status} ${response.statusText}`);
		}

		const data: OFFSearchResponseV1 = await response.json();

		return {
			items: data?.products?.map(mapOFFProductLiciousToFood) || [],
			total: data.count || 0,
			page: data.page || 0,
			size: data.page_size ?? 0
		};
	}

	private getHeaders() {
		return {
			'Content-Type': 'application/json',
			'User-Agent': 'LifeOSvault/0.0.1 (lkurasinski@gmail.com)'
		};
	}

	private async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
		return loggedFetch(input as string | Request, {
			...init,
			serviceName: 'OpenFoodFacts'
		});
	}
}
