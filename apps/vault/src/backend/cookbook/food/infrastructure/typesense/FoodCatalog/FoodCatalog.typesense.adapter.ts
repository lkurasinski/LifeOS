import type { FoodCatalogPort } from '$backend/cookbook/food/domain/ports/FoodCatalog.port';
import type { Food, FoodId, FoodSearchResults } from '$backend/cookbook/food/domain/food.types';
import type { FoodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';
import type { FoodSearchQuery } from '$backend/cookbook/food/application/handleSearchFood.query';
import { mapTypesenseFoodToFood } from '$backend/cookbook/food/infrastructure/typesense/FoodCatalog/FoodCatalog.typesense.mapper';
import type { Typesense_FoodDocument } from '$backend/cookbook/food/infrastructure/typesense/FoodCatalog/FoodCatalog.typesense.schema';
import { typesense } from '$backend/cookbook/food/infrastructure/typesense/client.typesense';

export class TypesenseFoodCatalogAdapter implements FoodCatalogPort {
	readonly name = 'home-baked' as const;
	readonly defaultPageSize = 25;
	readonly defaultPageNumber = 1;

	async search(query: FoodSearchQuery): Promise<FoodSearchResults> {
		const q = query.text || '*';
		const size = query.size || this.defaultPageSize;
		const page = query.page || this.defaultPageNumber;
		// const sortBy = (params.sortBy as string) || 'created_at:desc';
		const sortBy = 'created_at:desc'; //@TODO fix sorting

		const searchParams: Record<string, any> = {
			q,
			query_by: 'name_en,name_pl',
			per_page: size,
			page,
			sort_by: sortBy
		};

		if (query.exclude && query.exclude.length > 0) {
			searchParams.filter_by = `id:!=[${query.exclude.join(',')}]`;
		}

		const result = await typesense
			.collections<Typesense_FoodDocument>('foods')
			.documents()
			.search(searchParams);

		const hits = result.hits ?? [];
		const foods: Food[] = hits.map((hit) => {
			const doc = hit.document;
			return mapTypesenseFoodToFood(doc);
		});

		return {
			items: foods,
			total: result.found ?? 0,
			page,
			size: foods.length ?? 0
		};
	}

	async getById(id: FoodId, provider: FoodSourceProviders): Promise<Food | undefined> {
		return {} as Food; //@TODO to be implemented
	}
}
