/**
 * INFOODS Tagname nutrient information
 * Contains all nutrients with Polish/English names and units
 *
 * Based on INFOODS (International Food Data Systems) standard
 * https://www.fao.org/infoods/infoods/standards-guidelines/en/
 */

import type { Nutrient } from '../domain/cookbook/foods';

/** Common nutrients used for denormalized fields */
export const COMMON_NUTRIENTS = {
	ENERC_KCAL: 'energy_kcal',
	PROT: 'protein',
	FAT: 'fat',
	CHOCDF: 'carbs',
	FIBTG: 'fiber'
} as const;

/** Complete nutrient information registry */
export const NUTRIENTS: Record<string, Nutrient> = {
	// Energy
	ENERC_KCAL: {
		code: 'ENERC_KCAL',
		name_pl: 'Energia',
		name_en: 'Energy',
		unit: 'kcal',
		category: 'energy'
	},
	ENERC_KJ: {
		code: 'ENERC_KJ',
		name_pl: 'Energia',
		name_en: 'Energy',
		unit: 'kJ',
		category: 'energy'
	},
	ENERC_ATWS: {
		code: 'ENERC_ATWS',
		name_pl: 'Energia (Atwater specyficzny)',
		name_en: 'Energy (Atwater specific factor)',
		unit: 'kcal',
		category: 'energy'
	},
	ENERC_ATW: {
		code: 'ENERC_ATW',
		name_pl: 'Energia (Atwater ogólny)',
		name_en: 'Energy (Atwater general factor)',
		unit: 'kcal',
		category: 'energy'
	},

	// Macronutrients
	PROT: {
		code: 'PROT',
		name_pl: 'Białko',
		name_en: 'Protein',
		unit: 'g',
		category: 'macronutrient'
	},
	FAT: {
		code: 'FAT',
		name_pl: 'Tłuszcze ogółem',
		name_en: 'Total lipid (fat)',
		unit: 'g',
		category: 'macronutrient'
	},
	CHOCDF: {
		code: 'CHOCDF',
		name_pl: 'Węglowodany',
		name_en: 'Carbohydrate, by difference',
		unit: 'g',
		category: 'macronutrient'
	},
	FIBTG: {
		code: 'FIBTG',
		name_pl: 'Błonnik pokarmowy',
		name_en: 'Fiber, total dietary',
		unit: 'g',
		category: 'macronutrient'
	},
	WATER: { code: 'WATER', name_pl: 'Woda', name_en: 'Water', unit: 'g', category: 'macronutrient' },
	ASH: { code: 'ASH', name_pl: 'Popiół', name_en: 'Ash', unit: 'g', category: 'macronutrient' },

	// Minerals
	CA: { code: 'CA', name_pl: 'Wapń', name_en: 'Calcium', unit: 'mg', category: 'mineral' },
	FE: { code: 'FE', name_pl: 'Żelazo', name_en: 'Iron', unit: 'mg', category: 'mineral' },
	MG: { code: 'MG', name_pl: 'Magnez', name_en: 'Magnesium', unit: 'mg', category: 'mineral' },
	P: { code: 'P', name_pl: 'Fosfor', name_en: 'Phosphorus', unit: 'mg', category: 'mineral' },
	K: { code: 'K', name_pl: 'Potas', name_en: 'Potassium', unit: 'mg', category: 'mineral' },
	NA: { code: 'NA', name_pl: 'Sód', name_en: 'Sodium', unit: 'mg', category: 'mineral' },
	ZN: { code: 'ZN', name_pl: 'Cynk', name_en: 'Zinc', unit: 'mg', category: 'mineral' },
	CU: { code: 'CU', name_pl: 'Miedź', name_en: 'Copper', unit: 'mg', category: 'mineral' },
	MN: { code: 'MN', name_pl: 'Mangan', name_en: 'Manganese', unit: 'mg', category: 'mineral' },
	SE: { code: 'SE', name_pl: 'Selen', name_en: 'Selenium', unit: 'µg', category: 'mineral' },
	ID: { code: 'ID', name_pl: 'Jod', name_en: 'Iodine', unit: 'µg', category: 'mineral' },

	// Vitamins
	VITA_RAE: {
		code: 'VITA_RAE',
		name_pl: 'Witamina A (RAE)',
		name_en: 'Vitamin A, RAE',
		unit: 'µg',
		category: 'vitamin'
	},
	RETOL: { code: 'RETOL', name_pl: 'Retinol', name_en: 'Retinol', unit: 'µg', category: 'vitamin' },
	CARTB: {
		code: 'CARTB',
		name_pl: 'Karoten beta',
		name_en: 'Carotene, beta',
		unit: 'µg',
		category: 'vitamin'
	},
	VITC: {
		code: 'VITC',
		name_pl: 'Witamina C',
		name_en: 'Vitamin C, total ascorbic acid',
		unit: 'mg',
		category: 'vitamin'
	},
	VITD: {
		code: 'VITD',
		name_pl: 'Witamina D (D2 + D3)',
		name_en: 'Vitamin D (D2 + D3)',
		unit: 'µg',
		category: 'vitamin'
	},
	CHOCAL: {
		code: 'CHOCAL',
		name_pl: 'Witamina D (Cholecalciferol)',
		name_en: 'Vitamin D (D2 + D3)',
		unit: 'µg',
		category: 'vitamin'
	},
	TOCPHA: {
		code: 'TOCPHA',
		name_pl: 'Witamina E (alfa-tokoferol)',
		name_en: 'Vitamin E (alpha-tocopherol)',
		unit: 'mg',
		category: 'vitamin'
	},
	VITK1: {
		code: 'VITK1',
		name_pl: 'Witamina K (filochinon)',
		name_en: 'Vitamin K (phylloquinone)',
		unit: 'µg',
		category: 'vitamin'
	},
	THIA: {
		code: 'THIA',
		name_pl: 'Tiamina (witamina B1)',
		name_en: 'Thiamin',
		unit: 'mg',
		category: 'vitamin'
	},
	RIBF: {
		code: 'RIBF',
		name_pl: 'Ryboflawina (witamina B2)',
		name_en: 'Riboflavin',
		unit: 'mg',
		category: 'vitamin'
	},
	NIA: {
		code: 'NIA',
		name_pl: 'Niacyna (witamina B3)',
		name_en: 'Niacin',
		unit: 'mg',
		category: 'vitamin'
	},
	PANTAC: {
		code: 'PANTAC',
		name_pl: 'Kwas pantotenowy (witamina B5)',
		name_en: 'Pantothenic acid',
		unit: 'mg',
		category: 'vitamin'
	},
	VITB6A: {
		code: 'VITB6A',
		name_pl: 'Witamina B6',
		name_en: 'Vitamin B-6',
		unit: 'mg',
		category: 'vitamin'
	},
	BIOT: {
		code: 'BIOT',
		name_pl: 'Biotyna (witamina B7)',
		name_en: 'Biotin',
		unit: 'µg',
		category: 'vitamin'
	},
	FOL: {
		code: 'FOL',
		name_pl: 'Foliany ogółem',
		name_en: 'Folate, total',
		unit: 'µg',
		category: 'vitamin'
	},
	VITB12: {
		code: 'VITB12',
		name_pl: 'Witamina B12',
		name_en: 'Vitamin B-12',
		unit: 'µg',
		category: 'vitamin'
	},

	//MARK: Amino Acids
	ALA: { code: 'ALA', name_pl: 'Alanina', name_en: 'Alanine', unit: 'g', category: 'amino_acid' },
	ARG: { code: 'ARG', name_pl: 'Arginina', name_en: 'Arginine', unit: 'g', category: 'amino_acid' },
	ASP: {
		code: 'ASP',
		name_pl: 'Kwas asparaginowy',
		name_en: 'Aspartic acid',
		unit: 'g',
		category: 'amino_acid'
	},
	CYS: { code: 'CYS', name_pl: 'Cysteina', name_en: 'Cysteine', unit: 'g', category: 'amino_acid' },
	GLU: {
		code: 'GLU',
		name_pl: 'Kwas glutaminowy',
		name_en: 'Glutamic acid',
		unit: 'g',
		category: 'amino_acid'
	},
	GLY: { code: 'GLY', name_pl: 'Glicyna', name_en: 'Glycine', unit: 'g', category: 'amino_acid' },
	HIS: {
		code: 'HIS',
		name_pl: 'Histydyna',
		name_en: 'Histidine',
		unit: 'g',
		category: 'amino_acid'
	},
	ILE: {
		code: 'ILE',
		name_pl: 'Izoleucyna',
		name_en: 'Isoleucine',
		unit: 'g',
		category: 'amino_acid'
	},
	LEU: { code: 'LEU', name_pl: 'Leucyna', name_en: 'Leucine', unit: 'g', category: 'amino_acid' },
	LYS: { code: 'LYS', name_pl: 'Lizyna', name_en: 'Lysine', unit: 'g', category: 'amino_acid' },
	MET: {
		code: 'MET',
		name_pl: 'Metionina',
		name_en: 'Methionine',
		unit: 'g',
		category: 'amino_acid'
	},
	PHE: {
		code: 'PHE',
		name_pl: 'Fenyloalanina',
		name_en: 'Phenylalanine',
		unit: 'g',
		category: 'amino_acid'
	},
	PRO: { code: 'PRO', name_pl: 'Prolina', name_en: 'Proline', unit: 'g', category: 'amino_acid' },
	SER: { code: 'SER', name_pl: 'Seryna', name_en: 'Serine', unit: 'g', category: 'amino_acid' },
	THR: {
		code: 'THR',
		name_pl: 'Treonina',
		name_en: 'Threonine',
		unit: 'g',
		category: 'amino_acid'
	},
	TRP: {
		code: 'TRP',
		name_pl: 'Tryptofan',
		name_en: 'Tryptophan',
		unit: 'g',
		category: 'amino_acid'
	},
	TYR: { code: 'TYR', name_pl: 'Tyrozyna', name_en: 'Tyrosine', unit: 'g', category: 'amino_acid' },
	VAL: { code: 'VAL', name_pl: 'Walina', name_en: 'Valine', unit: 'g', category: 'amino_acid' },

	// Fatty Acids Summary
	FASAT: {
		code: 'FASAT',
		name_pl: 'Kwasy tłuszczowe nasycone',
		name_en: 'Fatty acids, total saturated',
		unit: 'g',
		category: 'fatty_acid'
	},
	FAMS: {
		code: 'FAMS',
		name_pl: 'Kwasy tłuszczowe jednonienasycone',
		name_en: 'Fatty acids, total monounsaturated',
		unit: 'g',
		category: 'fatty_acid'
	},
	FAPU: {
		code: 'FAPU',
		name_pl: 'Kwasy tłuszczowe wielonienasycone',
		name_en: 'Fatty acids, total polyunsaturated',
		unit: 'g',
		category: 'fatty_acid'
	},
	FATRN: {
		code: 'FATRN',
		name_pl: 'Kwasy tłuszczowe trans',
		name_en: 'Fatty acids, total trans',
		unit: 'g',
		category: 'fatty_acid'
	},

	// Important PUFAs
	F18D3N3: {
		code: 'F18D3N3',
		name_pl: 'Kwas alfa-linolenowy (ALA)',
		name_en: 'PUFA 18:3 n-3 (ALA)',
		unit: 'g',
		category: 'fatty_acid'
	},
	F20D5N3: {
		code: 'F20D5N3',
		name_pl: 'Kwas eikozapentaenowy (EPA)',
		name_en: 'PUFA 20:5 n-3 (EPA)',
		unit: 'g',
		category: 'fatty_acid'
	},
	F22D6N3: {
		code: 'F22D6N3',
		name_pl: 'Kwas dokozaheksaenowy (DHA)',
		name_en: 'PUFA 22:6 n-3 (DHA)',
		unit: 'g',
		category: 'fatty_acid'
	},

	// Sterols
	CHOLE: {
		code: 'CHOLE',
		name_pl: 'Cholesterol',
		name_en: 'Cholesterol',
		unit: 'mg',
		category: 'sterol'
	},

	// Sugars
	FRUS: { code: 'FRUS', name_pl: 'Fruktoza', name_en: 'Fructose', unit: 'g', category: 'sugar' },
	GLUS: { code: 'GLUS', name_pl: 'Glukoza', name_en: 'Glucose', unit: 'g', category: 'sugar' },
	LACS: { code: 'LACS', name_pl: 'Laktoza', name_en: 'Lactose', unit: 'g', category: 'sugar' },
	MALS: { code: 'MALS', name_pl: 'Maltoza', name_en: 'Maltose', unit: 'g', category: 'sugar' },
	SUCS: { code: 'SUCS', name_pl: 'Sacharoza', name_en: 'Sucrose', unit: 'g', category: 'sugar' },
	SUGAR: {
		code: 'SUGAR',
		name_pl: 'Cukry ogółem',
		name_en: 'Sugars, Total',
		unit: 'g',
		category: 'sugar'
	},

	STARCH: { code: 'STARCH', name_pl: 'Skrobia', name_en: 'Starch', unit: 'g', category: 'sugar' },
	STARES: {
		code: 'STARES', // @TODO should be STARES3
		name_pl: 'Starch, resistant RS3',
		name_en: 'Starch, resistant RS3',
		unit: 'g',
		category: 'sugar'
	},

	// Other
	CHOLN: {
		code: 'CHOLN',
		name_pl: 'Cholina ogółem',
		name_en: 'Choline, total',
		unit: 'mg',
		category: 'other'
	},
	BETN: { code: 'BETN', name_pl: 'Betaina', name_en: 'Betaine', unit: 'mg', category: 'other' },
	NT: { code: 'NT', name_pl: 'Azot', name_en: 'Nitrogen', unit: 'g', category: 'other' }
};

/**
 * Get nutrient info by INFOODS code
 * Returns undefined if code not found in registry
 */
export function getNutrientInfo(code: string): Nutrient | undefined {
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
