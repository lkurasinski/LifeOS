import type { LocalizedString } from '$backend/common/localizedString.factories';
import type { FoodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';
import type { Unit } from '$contracts/shared/Unit.dto';
import type { SearchResults } from '$backend/common/misc.types';

export type Food = {
	id?: FoodId;
	name: LocalizedString;
	category?: string;
	scientificName?: string;
	brand?: string;
	imageUrl?: string;
	source?: FoodSource;
	nutrients: FoodNutrientAmount[];
	userId?: number;
	createdAt?: Date;
	updatedAt?: Date;
};

export type FoodId = number;

export type FoodSource = {
	provider?: FoodSourceProviders;
	externalId?: string;
	url?: string;
};

export type Nutrient = {
	code: string;
	name: LocalizedString;
	unit: Unit;
	description?: LocalizedString;
	categoryId?: string;
};

export type FoodNutrientAmount = {
	nutrient: Nutrient;
	amount: number;
};

export type FoodSearchResults = SearchResults<Food>;
