import { z } from 'zod';

export const foodSourceProviders = z.enum(['fdc', 'openfoodfacts', 'home-baked']);

export const foodDataSourceDto = z.object({
	provider: foodSourceProviders,
	externalId: z.union([z.string(), z.number()]).optional(),
	url: z.string().url().optional(),
	importedAt: z.date().optional()
});
z;

export type FoodSource = z.infer<typeof foodDataSourceDto>;
export type FoodSourceProviders = z.infer<typeof foodSourceProviders>;
