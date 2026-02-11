import type { Food, FoodId } from '../food.types';

export interface FoodIndexPort {
	upsert(food: Food): Promise<void>;
	delete(id: FoodId): Promise<void>;
}
