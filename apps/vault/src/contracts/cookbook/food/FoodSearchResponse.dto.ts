import z from 'zod';
import { foodDtoSchema } from './Food.dto';

export const foodSearchResultsDtoSchema = z.object({
	items: z.array(foodDtoSchema),
	total: z.number().int().nonnegative(),
	page: z.number().int().positive(),
	size: z.number().int().positive()
});
export type FoodSearchResultsDto = z.infer<typeof foodSearchResultsDtoSchema>;
