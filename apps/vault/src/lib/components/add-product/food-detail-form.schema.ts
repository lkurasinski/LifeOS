import { z } from 'zod';

export const foodDetailFormSchema = z.object({
	namePl: z.string().optional(),
	nameEn: z.string().min(1, 'English name is required'),
	category: z.string().optional(),
	scientificName: z.string().optional()
});

export type FoodDetailFormSchema = z.infer<typeof foodDetailFormSchema>;
