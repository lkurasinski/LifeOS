/**
 * Internal Database Strategy Implementation
 *
 * Implements the FoodSourceStrategy for internal database foods.
 * Uses Typesense for search and Prisma for detail queries.
 */

import type { Food, FoodSearchParams, FoodSearchResults } from '$lib/domain/cookbook/foods';
import { typesense } from '$lib/server/typesense';
import { prisma } from '$lib/server/prisma';
import type { Typesense_Food } from '$lib/domain/cookbook/foods/integrations/typesense/typesense.schema';
import { mapTypesenseFoodToFood } from '$lib/domain/cookbook/foods/integrations/typesense/typesense.mappers';
import type { FoodSourceStrategy } from '$lib/services/food-sources';

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
			const doc = hit.document as Typesense_Food;
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

	async getById(sourceId: string | number): Promise<Food> {
		const id = sourceId.toString();

		const food = await prisma.food.findUnique({
			where: { id },
			include: {
				nutritionValues: {
					include: {
						nutrition: true
					}
				}
			}
		});

		if (!food) {
			throw new Error(`Food not found: ${id}`);
		}

		return {
			id: food.id,
			name_en: food.nameEn,
			name_pl: food.namePl,
			category: food.category,
			scientificName: food.scientificName,
			brand: null,
			nutrients: food.nutritionValues.map((nv) => ({
				nutrient: {
					code: nv.nutrition.id,
					name_pl: nv.nutrition.namePl || '',
					name_en: nv.nutrition.nameEn,
					unit: nv.nutrition.unit
				},
				value: nv.value
			})),
			source: food.fdcId
				? {
						provider: 'fdc' as const,
						externalId: food.fdcId
					}
				: {
						provider: 'custom' as const,
						externalId: food.id
					},
			userId: food.userId,
			createdAt: food.createdAt,
			updatedAt: food.updatedAt
		};
	}
}
