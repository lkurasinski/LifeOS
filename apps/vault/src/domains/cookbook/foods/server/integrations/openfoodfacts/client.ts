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

const API_V1_BASE_URL = 'https://world.openfoodfacts.org';
const API_LICIOUS_BASE_URL = 'https://search.openfoodfacts.org';

// Custom fetch wrapper for OpenFoodFacts API with logging
const offFetch: typeof fetch = (input, init) => {
	return loggedFetch(input as string | Request, {
		...init,
		serviceName: 'OpenFoodFacts'
	});
};

/**
 * Search foods using API v1
 */
export async function searchFoodsV1(params: {
	query: string;
	pageSize?: number;
	pageNumber?: number;
}): Promise<OFFSearchResponseV1> {
	const { query, pageSize = 25, pageNumber = 1 } = params;

	const url = new URL(`${API_V1_BASE_URL}/cgi/search.pl`);
	url.searchParams.set('search_terms', query);
	url.searchParams.set('page_size', pageSize.toString());
	url.searchParams.set('page', pageNumber.toString());
	url.searchParams.set('json', '1');
	url.searchParams.set(
		'fields',
		'code,product_name,product_name_en,generic_name,generic_name_en,brands,categories,nutriments,nutriscore_grade,nova_group,url,image_front_url,image_front_small_url'
	);

	const response = await offFetch(url.toString(), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'LifeOSvault/0.0.1 (lkurasinski@gmail.com)'
		}
	});

	if (!response.ok) {
		throw new Error(`OpenFoodFacts API v1 error: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

/**
 * Search foods using Search-a-licious (beta)
 */
export async function searchFoodsLicious(params: {
	query: string;
	pageSize?: number;
	pageNumber?: number;
}): Promise<OFFSearchResponseLicious> {
	const { query, pageSize = 25, pageNumber = 1 } = params;

	const url = new URL(`${API_LICIOUS_BASE_URL}/search`);
	url.searchParams.set('q', query);
	url.searchParams.set('page_size', pageSize.toString());
	url.searchParams.set('page', pageNumber.toString());
	url.searchParams.set(
		'fields',
		'code,product_name,product_name_en,brands,categories,nutriments,nutriscore_grade,nova_groups,image_front_url,image_front_small_url'
	);

	const response = await offFetch(url.toString(), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'LifeOSvault/0.0.1 (lkurasinski@gmail.com)'
		}
	});

	if (!response.ok) {
		throw new Error(
			`OpenFoodFacts Search-a-licious error: ${response.status} ${response.statusText}`
		);
	}

	return response.json();
}

/**
 * Get product details by barcode
 * Uses API v1 (both APIs share similar product detail structure)
 */
export async function getProductDetail(barcode: string): Promise<OFFProductDetailResponse> {
	const url = `${API_V1_BASE_URL}/api/v2/product/${barcode}`;

	const response = await offFetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'LifeOSvault/0.0.1 (lkurasinski@gmail.com)'
		}
	});

	if (!response.ok) {
		throw new Error(`OpenFoodFacts API error: ${response.status} ${response.statusText}`);
	}

	const data: OFFProductDetailResponse = await response.json();

	if (data.status !== 1) {
		throw new Error(`Product not found: ${barcode}`);
	}

	return data;
}

// Re-export types
export type {
	OFFSearchResponseV1,
	OFFSearchResponseLicious,
	OFFProductDetail,
	OFFProductDetailResponse
} from './types';
