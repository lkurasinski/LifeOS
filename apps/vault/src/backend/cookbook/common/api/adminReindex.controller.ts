import { logger } from '$lib/server/logger/logger';
import { json } from '@sveltejs/kit';
import { reindexAllUseCase } from '$backend/cookbook/common/application/reindexAll.usecase';
import { FoodPrismaRepository } from '$backend/cookbook/food/infrastructure/prisma/food.prisma.repository';
import { TypesenseFoodIndexAdapter } from '$backend/cookbook/food/infrastructure/typesense/FoodIndex/FoodIndex.typesense.adapter';

export function adminReindexController(userId: number | null) {
	const repo = new FoodPrismaRepository();
	const foodIndex = new TypesenseFoodIndexAdapter();

	try {
		return json(reindexAllUseCase({ repo, foodIndex }, userId));
	} catch (error) {
		logger.error({ error }, 'Reconciliation failed');
		return json(
			{
				success: false,
				error: 'Reconciliation failed'
			},
			{ status: 500 }
		);
	}
}
