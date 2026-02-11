import type { CreateOrUpdateFoodCommand } from '$backend/cookbook/food/application/handleCreateFood.command';
import type { FoodCoreDto } from '$contracts/cookbook/food/Food.dto';

export function mapFoodDtoToCommand(dto: FoodCoreDto): CreateOrUpdateFoodCommand {
	return {
		name: {
			en: dto.name.en,
			pl: dto.name.pl
		},
		scientificName: dto.scientificName,
		category: dto.category,
		brand: dto.brand,
		imageUrl: dto.imageUrl,
		source: dto.source && {
			externalId:
				dto.source.externalId === undefined || dto.source.externalId === null
					? undefined
					: String(dto.source.externalId),
			provider: dto.source.provider ?? undefined,
			url: dto.source.url ? buildSourceUrl(dto.source.provider, dto.source.externalId) : undefined
		},
		nutrients: dto.nutrients.map((n) => ({
			code: n.code,
			amount: n.amount
		}))
	};
}

function buildSourceUrl(
	provider: string | undefined,
	externalId: string | number | undefined
): string | undefined {
	if (!provider || !externalId) return undefined;

	switch (provider) {
		case 'fdc':
			return `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${externalId}/nutrients`;
		case 'openfoodfacts':
			return `https://pl.openfoodfacts.org/product/${externalId}`;
		default:
			return undefined;
	}
}
