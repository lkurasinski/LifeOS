import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminReindexController } from '$backend/cookbook/common/api/adminReindex.controller';

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
export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	return adminReindexController(locals.user.id);
};
