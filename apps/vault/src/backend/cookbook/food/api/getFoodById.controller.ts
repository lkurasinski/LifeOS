import { json } from '@sveltejs/kit';
import z from 'zod';
import { TypesenseFoodCatalogAdapter } from '$backend/cookbook/food/infrastructure/typesense/FoodCatalog/FoodCatalog.typesense.adapter';
import { FdcFoodCatalogAdapter } from '$backend/cookbook/food/infrastructure/fdc/FoodCatalog/FoodCatalog.fdc.adapter';
import type { FoodCatalogPort } from '$backend/cookbook/food/domain/ports/FoodCatalog.port';
import { OpenFoodFactsFoodCatalogAdapter } from '$backend/cookbook/food/infrastructure/openfoodfacts/FoodCatalog/FoodCatalog.openfoodfacts.adapter';
import { handleGetByIdQuery } from '$backend/cookbook/food/application/handleGetById.query';
import { getFoodByIdDtoRequestSchema } from '$contracts/cookbook/food/GetFoodByIdRequest.dto';
import { handleRequest } from '$backend/common/utils/url.utils';

export async function getFoodByIdController(
	pathParams: Record<string, string>,
	searchParams: URLSearchParams
): Promise<Response> {
	return handleRequest(pathParams, searchParams, getFoodByIdDtoRequestSchema, async (input) => {
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
		return handleGetByIdQuery(adapter, {
			id: input.id,
			provider: input.provider
		});
	});
}
