import { z } from 'zod';

export const TypesenseFoodSchema = z.object({
	id: z.string(),
	fdc_id: z.number().int().optional(),
	name_en: z.string(),
	name_pl: z.string().optional(),
	scientific_name: z.string().optional(),
	category: z.string().optional(),

	// Denormalized common nutrients (per 100g)
	energy_kcal: z.number().optional(),
	protein: z.number().optional(),
	fat: z.number().optional(),
	carbs: z.number().optional(),
	fiber: z.number().optional(),

	// Complete nutrient data with INFOODS codes as keys
	nutrients: z.record(z.string(), z.any()).optional(),

	created_at: z.number().int(),
	updated_at: z.number().int()
});

export type Typesense_Food = z.infer<typeof TypesenseFoodSchema>;
