import type { FoodRepositoryPort } from '$backend/cookbook/food/domain/ports/FoodRepository.port';
import type { Food, FoodId, FoodSource } from '$backend/cookbook/food/domain/food.types';
import type { LocalizedString } from '$backend/common/localizedString.factories';

export type CreateOrUpdateFoodCommand = {
	id?: FoodId;
	name: LocalizedString;
	category?: string;
	scientificName?: string;
	brand?: string;
	imageUrl?: string;
	source?: FoodSource;
	nutrients: {
		code: string;
		amount: number;
	}[];
	indexedAt?: string;
};

export async function handleCreateFoodCommand(
	repo: FoodRepositoryPort,
	input: {
		command: CreateOrUpdateFoodCommand;
		userId?: number;
	}
): Promise<Food> {
	const { command, userId } = input;

	return await repo.save(command, userId);
}
