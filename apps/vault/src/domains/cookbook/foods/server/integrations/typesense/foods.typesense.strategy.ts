/**
 * Internal Database Strategy Implementation
 *
 * Implements the FoodSourceStrategy for internal database foods.
 * Uses Typesense for search and Prisma for detail queries.
 */

import type { Food, FoodSearchParams, FoodSearchResults } from '$domains/cookbook/foods';
import { typesense } from '$lib/server/typesense';
import { prisma } from '$lib/server/prisma';
import type { Typesense_FoodDocument } from '$domains/cookbook/foods/server/integrations/typesense/foods.typesense.schema';
import { mapTypesenseFoodToFood } from '$domains/cookbook/foods/server/integrations/typesense/foods.typesense.mappers';
import type { FoodSourceStrategy } from '../../services/food-sources';

export class TypesenseStrategy implements FoodSourceStrategy {
	readonly name = 'internal' as const;

	async search(params: FoodSearchParams): Promise<FoodSearchResults> {
		const q = params.query || '*';
		const perPage = params.pageSize || 25;
		const page = params.pageNumber || 1;
		// const sortBy = (params.sortBy as string) || 'created_at:desc';
		const sortBy = 'created_at:desc'; //@TODO fix sorting

		const result = await typesense.collections('foods').documents().search({
			q,
			query_by: 'name_en,name_pl',
			per_page: perPage,
			page,
			sort_by: sortBy
		});

		const hits = result.hits ?? [];
		const foods: Food[] = hits.map((hit) => {
			const doc = hit.document as Typesense_FoodDocument;
			return mapTypesenseFoodToFood(doc);
		});

		return {
			items: foods,
			total: result.found ?? 0,
			page,
			pageSize: foods.length ?? 0, //@TODO
			totalPages: Math.ceil(result.found / perPage)
		};
	}

	async getById(sourceId: Food['id']): Promise<Food> {
		return {} as Food; //@TODO to be implemented
	}
}
