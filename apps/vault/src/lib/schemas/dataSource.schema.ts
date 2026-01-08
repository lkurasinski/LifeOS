import { z } from 'zod';

export const dataSourceProviders = z.enum(['fdc', 'openfoodfacts', 'home-baked']);
export const dataSourceSchema = z.object({
	provider: dataSourceProviders,
	externalId: z.union([z.string(), z.number()]).optional(),
	url: z.string().url().optional(),
	importedAt: z.date().optional()
});

export type DataSource = z.infer<typeof dataSourceSchema>;
