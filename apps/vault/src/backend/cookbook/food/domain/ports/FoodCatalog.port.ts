import type { Food, FoodId, FoodSearchResults } from '../food.types';
import type { CreateOrUpdateFoodCommand } from '$backend/cookbook/food/application/handleCreateFood.command';
import type { FoodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';
import type { FoodSearchQuery } from '$backend/cookbook/food/application/handleSearchFood.query';

export interface FoodCatalogPort {
	getById(id: FoodId, provider: FoodSourceProviders): Promise<Food | undefined>;

	search(query: FoodSearchQuery): Promise<FoodSearchResults>;
}
