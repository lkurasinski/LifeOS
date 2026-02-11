import type { FoodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';
import type { Food, FoodId } from '$backend/cookbook/food/domain/food.types';
import type { FoodCatalogPort } from '$backend/cookbook/food/domain/ports/FoodCatalog.port';
import type { FoodSearchResultsDto } from '$contracts/cookbook/food/FoodSearchResponse.dto';
import { type FoodDto, foodDtoSchema } from '$contracts/cookbook/food/Food.dto';

export type FoodSearchQuery = {
	provider: FoodSourceProviders;
	id?: FoodId;
	text?: string;
	category?: string;
	size: number;
	page: number;
	exclude?: string[] | undefined;
} & { [key: string]: string | string[] | number | undefined };

export async function handleSearchFoodQuery(
	port: FoodCatalogPort,
	input: {
		query: FoodSearchQuery;
	}
): Promise<FoodSearchResultsDto> {
	const results = await port.search(input.query);

	return {
		items: results.items.map(foodToResponseDto),
		total: results.total,
		page: results.page,
		size: results.size
	};
}

const foodToResponseDto = (food: Food): FoodDto => {
	console.log(foodDtoSchema.parse(food));
	console.log(food);
	return foodDtoSchema.parse(food);
};
