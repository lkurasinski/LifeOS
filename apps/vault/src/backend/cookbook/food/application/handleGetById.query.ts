import type { FoodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';
import type { FoodCatalogPort } from '$backend/cookbook/food/domain/ports/FoodCatalog.port';
import { type FoodDto, foodDtoSchema } from '$contracts/cookbook/food/Food.dto';

export async function handleGetByIdQuery(
	port: FoodCatalogPort,
	input: {
		id: string;
		provider: FoodSourceProviders;
	}
): Promise<FoodDto | undefined> {
	const raw = await port.getById(Number(input.id), input.provider);
	return foodDtoSchema.parse(raw);
}
