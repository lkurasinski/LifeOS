import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	findFoodsNeedingReindex,
	indexFoodsBatch,
	findRecipesNeedingReindex,
	indexRecipesBatch
} from '$lib/server/typesense/index';
import { logger } from '$lib/server/logger/logger';

/**
 * Reconciliation endpoint for Typesense indexing
 * Finds and reindexes foods/recipes that are out of sync
 *
 * This should be called by a cron job every 5 minutes
 *
 * Usage:
 * - Manual trigger: POST /api/admin/reindex
 * - With cron: Add to vercel.json or railway.json
 * - Local cron: Add to crontab or use node-cron
 *
 * Security: Add authentication if deploying to production!
 */
export const POST: RequestHandler = async ({ request }) => {
	const startTime = Date.now();

	try {
		// Optional: Add API key authentication
		const authHeader = request.headers.get('authorization');
		const expectedKey = process.env.ADMIN_API_KEY;

		if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
			logger.warn('Unauthorized reindex attempt');
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		logger.info('Starting Typesense reconciliation');

		// Find foods needing reindex
		const foodIds = await findFoodsNeedingReindex();
		logger.info({ count: foodIds.length }, 'Found foods needing reindex');

		// Index foods in batch
		const foodsIndexed = await indexFoodsBatch(foodIds);
		logger.info({ indexed: foodsIndexed, total: foodIds.length }, 'Foods reindexed');

		// Find recipes needing reindex
		const recipeIds = await findRecipesNeedingReindex();
		logger.info({ count: recipeIds.length }, 'Found recipes needing reindex');

		// Index recipes in batch
		const recipesIndexed = await indexRecipesBatch(recipeIds);
		logger.info({ indexed: recipesIndexed, total: recipeIds.length }, 'Recipes reindexed');

		const duration = Date.now() - startTime;

		return json({
			success: true,
			duration_ms: duration,
			foods: {
				found: foodIds.length,
				indexed: foodsIndexed,
				failed: foodIds.length - foodsIndexed
			},
			recipes: {
				found: recipeIds.length,
				indexed: recipesIndexed,
				failed: recipeIds.length - recipesIndexed
			}
		});
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
};
