import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// TODO: Load user's recipes from database
	return {
		recipes: []
	};
};
