import type { Food, FoodId } from '$backend/cookbook/food/domain/food.types';
import { typesense } from '$lib/server/typesense';
import type { FoodIndexPort } from '$backend/cookbook/food/domain/ports/FoodIndex.port';
import { mapFoodToTypesenseDoc } from '$backend/cookbook/food/infrastructure/typesense/FoodIndex/FoodIndex.typesense.mapper';

export class TypesenseFoodIndexAdapter implements FoodIndexPort {
	readonly collectionName = 'foods' as const;

	async upsert(food: Food): Promise<void> {
		const document = mapFoodToTypesenseDoc(food);
		await typesense.collections(this.collectionName).documents().upsert(document);
	}
	async delete(id: FoodId): Promise<void> {}
}
