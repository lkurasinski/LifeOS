import { logger } from '$lib/server/logger/logger';
import type { FoodRepositoryPort } from '$backend/cookbook/food/domain/ports/FoodRepository.port';
import type { FoodIndexPort } from '$backend/cookbook/food/domain/ports/FoodIndex.port';
import type { FoodId } from '$backend/cookbook/food/domain/food.types';

type IndexFoodDependencies = {
	repo: FoodRepositoryPort;
	index: FoodIndexPort;
};

type IndexFoodCmd = {
	foodId: FoodId;
	userId?: number;
};

/**
 * Index a single food to Typesense
 * Returns true on success, false on failure
 */
export async function indexFood(
	deps: IndexFoodDependencies,
	{ foodId, userId }: IndexFoodCmd
): Promise<boolean> {
	try {
		const food = await deps.repo.getById(foodId);

		if (!food || !food.id || typeof food.id === 'undefined') {
			logger.warn({ foodId }, 'Food not found for indexing');
			return false;
		}

		await deps.index.upsert(food);

		try {
			await deps.repo.save(
				{
					...food,
					nutrients: food.nutrients.map((el) => ({ code: el.nutrient.code, amount: el.amount })),
					indexedAt: new Date().toISOString()
				},
				userId
			);
		} catch (err) {
			// Ignore if indexedAt field doesn't exist yet (migration pending)
			logger.warn({ foodId }, 'Could not update indexedAt - migration may be pending');
		}

		logger.info({ foodId }, 'Food indexed successfully');
		return true;
	} catch (error) {
		logger.error({ foodId, error }, 'Failed to index food to Typesense');
		return false;
	}
}

/**
 * Index multiple foods in batch
 * Returns count of successfully indexed foods
 */
type IndexFoodBatchCmd = {
	foodIds: FoodId[];
	userId?: number;
};
export async function indexFoodsBatch(
	deps: IndexFoodDependencies,
	{ foodIds, userId }: IndexFoodBatchCmd
): Promise<number> {
	let successCount = 0;

	for (const foodId of foodIds) {
		const success = await indexFood(deps, { foodId: foodId, userId: userId });
		if (success) successCount++;
	}

	return successCount;
}

/**
 * Find foods that need reindexing (updated_at > indexed_at or indexed_at is null)
 */
export async function findFoodsNeedingReindex(repo: FoodRepositoryPort): Promise<FoodId[]> {
	try {
		return repo.findElementsNeedingReindex();
	} catch (err) {
		// If indexedAt field doesn't exist yet, return empty array
		logger.warn('Could not find foods needing reindex - migration may be pending');
		return [];
	}
}
