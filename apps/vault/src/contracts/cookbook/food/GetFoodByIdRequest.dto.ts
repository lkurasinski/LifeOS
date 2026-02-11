// ============================================================================
// SEARCH & QUERY
// ============================================================================
import z from 'zod';
import { foodSourceProviders } from '$contracts/cookbook/food/FoodDataSource.dto';

export const getFoodByIdDtoRequestSchema = z.object({
	id: z.string(),
	provider: foodSourceProviders
});
export type getFoodByIdDto = z.infer<typeof getFoodByIdDtoRequestSchema>;
