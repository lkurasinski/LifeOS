import { FoodPrismaRepository } from '$backend/cookbook/food/infrastructure/prisma/food.prisma.repository';
import { json } from '@sveltejs/kit';
import z from 'zod';
import {
	type CreateOrUpdateFoodCommand,
	handleCreateFoodCommand
} from '$backend/cookbook/food/application/handleCreateFood.command';
import { createFoodRequestDto } from '$contracts/cookbook/food/CreateFoodRequest.dto';
import { isUniqueConstraintError } from '$lib/server/slug';
import { mapFoodDtoToCommand } from '$backend/cookbook/food/api/mapFoodDtoToCommand';

export async function createFoodController(body: unknown, userId?: number): Promise<Response> {
	try {
		const input = createFoodRequestDto.parse(body);

		const repo = new FoodPrismaRepository();

		const food = await handleCreateFoodCommand(repo, {
			command: mapFoodDtoToCommand(input),
			userId
		});

		return json(food, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
		}

		if (isUniqueConstraintError(error)) {
			return json({ error: 'This food already exists in the database' }, { status: 409 });
		}

		console.error('Food creation error:', error);
		return json({ error: 'Failed to create food' }, { status: 500 });
	}
}
