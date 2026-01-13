import { z } from 'zod';
import { dataSourceProviders } from '$lib';

export const TypesenseFoodSchema = z.object({
	id: z.string(),

	name_en: z.string(),
	name_pl: z.string().optional(),
	scientific_name: z.string().optional(),

	category: z.string().optional(),
	brand: z.string().optional(),

	// denormalized per 100g
	energy_kcal: z.number().optional(),
	protein: z.number().optional(),
	fat: z.number().optional(),
	carbs: z.number().optional(),
	fiber: z.number().optional(),

	nutrients: z.record(z.string(), z.number()).optional(),

	source_provider: dataSourceProviders,
	source_external_id: z.string().optional(),
	source_url: z.string().optional(),

	created_at: z.number().int(),
	updated_at: z.number().int()
});

export type Typesense_FoodDocument = z.infer<typeof TypesenseFoodSchema>;
