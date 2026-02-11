import { z } from 'zod';
import { foodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';

export const typesenseFoodDocumentSchema = z.object({
	brand: z.string().optional(),
	carbs: z.number().optional(),
	category: z.string().optional(),
	created_at: z.number().int(), //@todo needd to be changed for string
	energy_kcal: z.number().optional(), //@TODO need to indexed
	fat: z.number().optional(),
	fiber: z.number().optional(),
	id: z.string(),
	name_en: z.string(),
	name_pl: z.string().optional(),
	nutrients: z.record(z.string(), z.number()).optional(),
	protein: z.number().optional(),
	scientific_name: z.string().optional(),
	source_external_id: z.string().optional(),
	source_provider: foodSourceProviders,
	source_url: z.string().optional(),
	updated_at: z.number().int() //@todo needd to be changed for string
});

export type Typesense_FoodDocument = z.infer<typeof typesenseFoodDocumentSchema>;
