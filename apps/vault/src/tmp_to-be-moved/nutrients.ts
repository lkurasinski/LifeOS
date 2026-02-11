import { NUTRIENTS } from '$backend/cookbook/common/nutrient/nutrient';
import type { NutrientDto } from '$contracts/cookbook/food/Food.dto';

/**
 * Get nutrient info by INFOODS code
 * Returns undefined if code not found in registry
 */
export function getNutrientInfo(code: string) {
	return NUTRIENTS[code];
}

/**
 * Get nutrient name in specified language
 */
export function getNutrientName(code: string, lang: 'pl' | 'en' = 'pl'): string {
	const info = NUTRIENTS[code];
	if (!info) return code;
	return lang === 'pl' ? info.name_pl : info.name_en;
}

/**
 * Get nutrient unit
 */
export function getNutrientUnit(code: string): string {
	const info = NUTRIENTS[code];
	return info?.unit || '';
}

/**
 * Format nutrient value with unit
 */
export function formatNutrientValue(code: string, value: number, lang: 'pl' | 'en' = 'pl'): string {
	const info = NUTRIENTS[code];
	if (!info) return `${value}`;

	// Format number based on unit
	let formattedValue: string;
	if (info.unit === 'kcal' || info.unit === 'kJ') {
		formattedValue = Math.round(value).toString();
	} else if (value >= 10) {
		formattedValue = value.toFixed(1);
	} else if (value >= 1) {
		formattedValue = value.toFixed(2);
	} else {
		formattedValue = value.toFixed(3);
	}

	return `${formattedValue} ${info.unit}`;
}
