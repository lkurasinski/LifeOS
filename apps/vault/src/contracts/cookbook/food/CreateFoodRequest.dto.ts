import { z } from 'zod';
import { foodDataSourceDto } from '$lib';
import { foodCoreDtoSchema } from './Food.dto';

export const createFoodRequestDto = foodCoreDtoSchema;

export type CreateFoodRequestDto = z.infer<typeof createFoodRequestDto>;
