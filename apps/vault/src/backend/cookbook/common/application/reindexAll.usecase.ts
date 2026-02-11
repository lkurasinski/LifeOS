// shared/application/use-cases/reindexAll.usecase.ts

import type { FoodIndexPort } from '$backend/cookbook/food/domain/ports/FoodIndex.port';
import { logger } from '$lib/server/logger/logger';
import {
	findFoodsNeedingReindex,
	indexFoodsBatch
} from '$backend/cookbook/food/application/handleIndexFood.usecase';
import type { FoodRepositoryPort } from '$backend/cookbook/food/domain/ports/FoodRepository.port';

type Dependencies = {
	repo: FoodRepositoryPort;
	foodIndex: FoodIndexPort;
	// reindexRecipes: ReindexRecipesUseCase;
};

export type ReindexAllResult = {
	foods: {
		found: number;
		indexed: number;
		failed: number;
	};
	// recipes: {
	// 	found: number;
	// 	indexed: number;
	// 	failed: number;
	// };
	duration: number;
};

export const reindexAllUseCase = async (
	deps: Dependencies,
	userId?: number
): Promise<ReindexAllResult> => {
	const startTime = Date.now();

	logger.info('Starting Typesense reconciliation');
	const foodIds = await findFoodsNeedingReindex(deps.repo);
	logger.info({ count: foodIds.length }, 'Found foods needing reindex');

	const foodsIndexed = await indexFoodsBatch(
		{ index: deps.foodIndex, repo: deps.repo },
		{ foodIds, userId }
	);
	logger.info({ indexed: foodsIndexed, total: foodIds.length }, 'Foods reindexed');

	// // Find recipes needing reindex
	// const recipeIds = await findRecipesNeedingReindex();
	// logger.info({ count: recipeIds.length }, 'Found recipes needing reindex');
	//
	// // Index recipes in batch
	// const recipesIndexed = await indexRecipesBatch(recipeIds);
	// logger.info({ indexed: recipesIndexed, total: recipeIds.length }, 'Recipes reindexed');
	const duration = Date.now() - startTime;

	return {
		duration: duration,
		foods: {
			found: foodIds.length,
			indexed: foodsIndexed,
			failed: foodIds.length - foodsIndexed
		}
		// recipes: {
		// 	found: recipeIds.length,
		// 	indexed: recipesIndexed,
		// 	failed: recipeIds.length - recipesIndexed
		// }
	};
};
