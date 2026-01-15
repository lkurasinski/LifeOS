/**
 * OpenFoodFacts API Types
 *
 * Types for both API v1 and Search-a-licious (beta) endpoints
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface OFFNutriment {
	value?: number;
	unit?: string;
}

export interface OFFNutriments {
	energy_value?: number;
	energy_unit?: string;
	'energy-kcal'?: number;
	'energy-kcal_value'?: number;
	'energy-kcal_unit'?: string;
	fat?: number;
	fat_value?: number;
	fat_unit?: string;
	'saturated-fat'?: number;
	'saturated-fat_value'?: number;
	'saturated-fat_unit'?: string;
	carbohydrates?: number;
	carbohydrates_value?: number;
	carbohydrates_unit?: string;
	sugars?: number;
	sugars_value?: number;
	sugars_unit?: string;
	fiber?: number;
	fiber_value?: number;
	fiber_unit?: string;
	proteins?: number;
	proteins_value?: number;
	proteins_unit?: string;
	salt?: number;
	salt_value?: number;
	salt_unit?: string;
	sodium?: number;
	sodium_value?: number;
	sodium_unit?: string;
	[key: string]: number | string | undefined;
}

// ============================================================================
// API V1 TYPES
// ============================================================================

export interface OFFProductV1 {
	code?: string;
	product_name?: string;
	product_name_en?: string;
	generic_name?: string;
	generic_name_en?: string;
	brands?: string;
	categories?: string;
	nutriments?: OFFNutriments;
	nutriscore_grade?: string;
	nova_group?: number;
	url?: string;
}

export interface OFFSearchResponseV1 {
	count: number;
	page: number;
	page_count: number;
	page_size: number;
	products: OFFProductV1[];
}

// ============================================================================
// SEARCH-A-LICIOUS TYPES
// ============================================================================

export interface OFFProductLicious {
	code?: string;
	product_name?: string;
	product_name_en?: string;
	brands?: string;
	categories?: string;
	nutriments?: OFFNutriments;
	nutriscore_grade?: string;
	nova_groups?: string;
}

export interface OFFSearchResponseLicious {
	count: number;
	page: number;
	page_count: number;
	page_size: number;
	took: number;
	hits: OFFProductLicious[];
}

// ============================================================================
// PRODUCT DETAIL TYPES (Both APIs share similar structure)
// ============================================================================

export interface OFFProductDetail {
	code: string;
	product_name?: string;
	product_name_en?: string;
	generic_name?: string;
	generic_name_en?: string;
	brands?: string;
	brands_tags?: string[];
	categories?: string;
	categories_tags?: string[];
	nutriments: OFFNutriments;
	nutriscore_grade?: string;
	nova_group?: number;
	url?: string;
}

export interface OFFProductDetailResponse {
	code: string;
	product: OFFProductDetail;
	status: number;
	status_verbose: string;
}
