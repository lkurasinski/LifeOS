import z from 'zod';

export const Unit = z.enum([
	'gram',
	'ml',
	'liter',
	'kilogram',
	'teaspoon',
	'tablespoon',
	'cup',
	'piece',
	'pinch',
	'clove',
	'slice',
	'handful',
	'can',
	'package'
]);
export type Unit = z.infer<typeof Unit>;
