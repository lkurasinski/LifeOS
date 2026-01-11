/**
 * Common interfaces for food data sources
 */

export type DataSource = 'fdc' | 'openfoodfacts';

export interface CommonFoodSearchResult {
	sourceId: string | number;
	source: DataSource;
	name: string;
	description?: string;
	category?: string;
	brand?: string;
	metadata?: Record<string, any>;
}

export interface CommonFoodDetail {
	sourceId: string | number;
	source: DataSource;
	name: string;
	description?: string;
	category?: string;
	scientificName?: string;
	brand?: string;
	nutrients: Array<{
		code: string; // INFOODS code
		value: number;
		unit: string;
	}>;
	metadata?: Record<string, any>;
}

export interface FoodFormData {
	fdcData?: any;
	offData?: any; // OpenFoodFacts data
	overrides?: {
		namePl?: string;
		nameEn?: string;
		category?: string;
		scientificName?: string;
	};
}
