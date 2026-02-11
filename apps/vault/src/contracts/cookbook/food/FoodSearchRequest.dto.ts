// ============================================================================
// SEARCH & QUERY
// ============================================================================
import z from 'zod';
import { foodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';

export const foodSearchRequestDto = z.object({
	provider: foodSourceProviders,
	text: z.string().optional(),
	category: z.string().optional(),

	// ✅ coerce obsługuje "25" → 25 automatycznie
	size: z.coerce.number().int().positive().default(25),
	page: z.coerce.number().int().positive().default(1),

	// ✅ Comma-separated string LUB array
	exclude: z.preprocess(
		(val) => (typeof val === 'string' ? val.split(',').filter(Boolean) : val),
		z.array(z.string()).optional()
	),

	dataType: z.string().optional(),
	apiVersion: z.string().optional()
});
export type FoodSearchRequestDto = z.infer<typeof foodSearchRequestDto>;
