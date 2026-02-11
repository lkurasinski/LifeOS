import z from 'zod';

export const unit = z.enum([
	'IU',
	'kcal',
	'kJ',
	'g',
	'mg',
	'mcg',
	'ml',
	'l',
	'kg',
	'teaspoon',
	'tablespoon',
	'cup',
	'piece',
	'pinch',
	'clove',
	'slice',
	'handful',
	'can',
	'package',
	'none'
]);
export type Unit = z.infer<typeof unit>;
