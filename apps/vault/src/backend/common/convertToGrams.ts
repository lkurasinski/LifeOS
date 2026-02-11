/**
 * Convert nutrient value to grams for comparison
 * This allows sorting nutrients with different units (g, mg, µg, etc.)
 */
export function convertToGrams(value: number, unit: string): number {
	const unitLower = unit.toLowerCase().trim();

	switch (unitLower) {
		case 'g':
			return value;
		case 'mg':
			return value / 1000;
		case 'µg':
		case 'mcg':
		case 'ug':
		case 'IU':
			return value / 1000000;
		case 'kg':
			return value * 1000;
		case 'kcal':
			return value * 2; //its not true, for now sufficient for sorting
		case 'kj':
			return value / 4184;
		default:
			return value;
	}
}
