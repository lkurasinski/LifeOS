import type { Food, FoodId } from '../food.types';
import type { CreateOrUpdateFoodCommand } from '$backend/cookbook/food/application/handleCreateFood.command';

export interface FoodRepositoryPort {
	getById(id: FoodId): Promise<Food>;

	save(food: CreateOrUpdateFoodCommand, userI?: number): Promise<Food>;

	delete(id: FoodId): Promise<void>;

	findElementsNeedingReindex(): Promise<FoodId[]>;
}
