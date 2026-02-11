import z from 'zod';

export const localizedStringDto = z.object({
	pl: z.string().optional(),
	en: z.string().optional()
});

export type LocalizedStringDto = z.infer<typeof localizedStringDto>;
