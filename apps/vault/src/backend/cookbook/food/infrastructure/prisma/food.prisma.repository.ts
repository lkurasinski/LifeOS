import type { Food, FoodId } from '../../domain/food.types';
import { prismaFoodToDomain } from './food.prisma-to-domain.mapper';
import { foodDomainToPrismaCreate, foodDomainToPrismaUpdate } from './food.domain-to-prisma.mapper';
import { PrismaClient } from '@lifeos/db';
import type { FoodRepositoryPort } from '../../domain/ports/FoodRepository.port';
import type { CreateOrUpdateFoodCommand } from '$backend/cookbook/food/application/handleCreateFood.command';
import { NotFoundError } from '$backend/common/utils/api.utils';

const prisma = new PrismaClient();

export class FoodPrismaRepository implements FoodRepositoryPort {
	constructor(private readonly client: PrismaClient = prisma) {}

	async getById(id: FoodId): Promise<Food> {
		const row = await this.client.food.findUnique({
			where: { id },
			include: {
				nutritions: {
					include: {
						nutrition: true
					}
				}
			}
		});
		if (!row) {
			throw new NotFoundError('PrismaRepository', id.toString());
		}
		return prismaFoodToDomain(row);
	}

	async save(food: CreateOrUpdateFoodCommand, userId?: number): Promise<Food> {
		return this.client.$transaction(async (tx) => {
			/***********    CREATE    ***********/
			if (!food.id || food.id <= 0) {
				const { foodData, foodNutritionsData } = foodDomainToPrismaCreate(food, userId);

				const createdFood = await tx.food.create({ data: foodData });

				if (foodNutritionsData.length > 0) {
					await tx.foodNutrition.createMany({
						data: foodNutritionsData.map((el) => ({
							...el,
							foodId: createdFood.id
						})),
						skipDuplicates: true
					});
				}

				const res = this.getById(createdFood.id);

				if (res !== null) {
					throw Error(`Could not find a food with id ${createdFood.id}`);
				}

				return res;
			}

			/***********    UPDATE    ***********/
			const { foodData, foodNutritionsData } = foodDomainToPrismaUpdate(food, userId);

			const updatedFood = await tx.food.update({
				where: { id: food.id },
				data: foodData
			});

			await tx.foodNutrition.deleteMany({
				where: { foodId: updatedFood.id }
			});

			if (foodNutritionsData.length > 0) {
				await tx.foodNutrition.createMany({
					data: foodNutritionsData.map((nv) => ({
						...nv,
						foodId: updatedFood.id
					})),
					skipDuplicates: true
				});
			}

			const res = this.getById(updatedFood.id);

			if (res !== null) {
				throw Error(`Could not find a food with id ${updatedFood.id}`);
			}

			return res;
		});
	}

	async delete(id: number): Promise<void> {
		await this.client.food.delete({ where: { id } });
	}

	async findElementsNeedingReindex(): Promise<FoodId[]> {
		const foods = await prisma.food.findMany({
			where: {
				OR: [
					{ indexedAt: null },
					{
						updatedAt: {
							gt: prisma.food.fields.indexedAt
						}
					}
				]
			},
			select: { id: true },
			orderBy: { updatedAt: 'desc' },
			take: 100 // Limit to avoid overwhelming
		});

		return foods.map((f) => f.id);
	}

	// async findByName(name: string): Promise<Food[]> {
	// 	const rows = await this.client.food.findMany({
	// 		where: {
	// 			OR: [
	// 				{ nameEn: { contains: name, mode: 'insensitive' } },
	// 				{ namePl: { contains: name, mode: 'insensitive' } }
	// 			]
	// 		},
	// 		include: { nutritions: true }
	// 	});
	//
	// 	return rows.map(prismaFoodToDomain);
	// }
}
