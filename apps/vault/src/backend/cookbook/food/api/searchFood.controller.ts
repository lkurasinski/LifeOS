import { json } from '@sveltejs/kit';
import z from 'zod';
import { handleSearchFoodQuery } from '$backend/cookbook/food/application/handleSearchFood.query';
import { TypesenseFoodCatalogAdapter } from '$backend/cookbook/food/infrastructure/typesense/FoodCatalog/FoodCatalog.typesense.adapter';
import { foodSearchRequestDto } from '$contracts/cookbook/food/FoodSearchRequest.dto';
import { FdcFoodCatalogAdapter } from '$backend/cookbook/food/infrastructure/fdc/FoodCatalog/FoodCatalog.fdc.adapter';
import type { FoodCatalogPort } from '$backend/cookbook/food/domain/ports/FoodCatalog.port';
import { OpenFoodFactsFoodCatalogAdapter } from '$backend/cookbook/food/infrastructure/openfoodfacts/FoodCatalog/FoodCatalog.openfoodfacts.adapter';
import { parseParams } from '$lib/utils';

export async function searchFoodController(params: URLSearchParams): Promise<Response> {
	try {
		console.log(params);
		const input = foodSearchRequestDto.parse(parseParams(params));
		console.log('dupa');

		let adapter: FoodCatalogPort;

		switch (input.provider) {
			case 'fdc':
				adapter = new FdcFoodCatalogAdapter();
				break;
			case 'openfoodfacts':
				adapter = new OpenFoodFactsFoodCatalogAdapter();
				break;
			case 'home-baked':
			default:
				adapter = new TypesenseFoodCatalogAdapter();
		}

		const { text, category, provider, size, page, exclude, ...rest } = input;

		const res = await handleSearchFoodQuery(adapter, {
			query: {
				provider,
				text: text,
				category,
				size,
				page,
				exclude,
				...rest
			}
		});

		return json(res, { status: 200 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
		}

		console.error('Search error:', error);
		return json({ error: 'Search error' }, { status: 500 });
	}
}
