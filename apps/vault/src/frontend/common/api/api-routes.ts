/**
 * Central definition of all internal API routes.
 * Use these constants instead of hardcoding paths throughout the app.
 */
import type { FoodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';

const AUTH_ROUTES = {
	LOGIN: '/api/auth/login',
	LOGOUT: '/api/auth/logout',
	REGISTER: '/api/auth/register'
};

const FOOD_ROUTES = {
	CREATE: '/api/foods',
	SEARCH: '/api/foods/search',
	DETAILS: (id: string | number, provider?: FoodSourceProviders) => {
		const path = `/api/foods/${id}`;
		return provider ? `${path}?provider=${provider}` : path;
	}
};

const RECIPE_ROUTES = {
	CREATE: '/api/recipes',
	SEARCH: '/api/recipes/search',
	DETAILS: (id: string | number) => `/api/recipes/${id}`,
	UPDATE: (id: string | number) => `/api/recipes/${id}`,
	DELETE: (id: string | number) => `/api/recipes/${id}`
};

export const API_ROUTES = {
	AUTH: AUTH_ROUTES,
	FOODS: FOOD_ROUTES,
	RECIPES: RECIPE_ROUTES
} as const;

export function buildSearchUrl(
	baseUrl: string,
	params: Record<string, string | number | boolean | string[] | undefined>
): string {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null) return;

		if (Array.isArray(value)) {
			searchParams.set(key, value.join(','));
		} else {
			searchParams.set(key, String(value));
		}
	});

	const query = searchParams.toString();
	return query ? `${baseUrl}?${query}` : baseUrl;
}
