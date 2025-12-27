/**
 * INFOODS Tagname nutrient information
 * Contains all nutrients with Polish/English names and units
 *
 * Based on INFOODS (International Food Data Systems) standard
 * https://www.fao.org/infoods/infoods/standards-guidelines/en/
 */

export interface NutrientInfo {
	/** INFOODS tagname code */
	code: string;
	/** Polish name */
	namePl: string;
	/** English name */
	nameEn: string;
	/** Unit of measurement */
	unit: string;
	/** Category for grouping */
	category:
		| 'energy'
		| 'macronutrient'
		| 'mineral'
		| 'vitamin'
		| 'amino_acid'
		| 'fatty_acid'
		| 'sterol'
		| 'sugar'
		| 'other';
}

/** Common nutrients used for denormalized fields */
export const COMMON_NUTRIENTS = {
	ENERC_KCAL: 'energy_kcal',
	PROT: 'protein',
	FAT: 'fat',
	CHOCDF: 'carbs',
	FIBTG: 'fiber'
} as const;

/** Complete nutrient information registry */
export const NUTRIENTS: Record<string, NutrientInfo> = {
	// Energy
	ENERC_KCAL: {
		code: 'ENERC_KCAL',
		namePl: 'Energia',
		nameEn: 'Energy',
		unit: 'kcal',
		category: 'energy'
	},
	ENERC_KJ: {
		code: 'ENERC_KJ',
		namePl: 'Energia',
		nameEn: 'Energy',
		unit: 'kJ',
		category: 'energy'
	},
	ENERC_ATWS: {
		code: 'ENERC_ATWS',
		namePl: 'Energia (Atwater specyficzny)',
		nameEn: 'Energy (Atwater specific factor)',
		unit: 'kcal',
		category: 'energy'
	},
	ENERC_ATW: {
		code: 'ENERC_ATW',
		namePl: 'Energia (Atwater ogólny)',
		nameEn: 'Energy (Atwater general factor)',
		unit: 'kcal',
		category: 'energy'
	},

	// Macronutrients
	PROT: { code: 'PROT', namePl: 'Białko', nameEn: 'Protein', unit: 'g', category: 'macronutrient' },
	FAT: {
		code: 'FAT',
		namePl: 'Tłuszcze ogółem',
		nameEn: 'Total lipid (fat)',
		unit: 'g',
		category: 'macronutrient'
	},
	CHOCDF: {
		code: 'CHOCDF',
		namePl: 'Węglowodany',
		nameEn: 'Carbohydrate, by difference',
		unit: 'g',
		category: 'macronutrient'
	},
	FIBTG: {
		code: 'FIBTG',
		namePl: 'Błonnik pokarmowy',
		nameEn: 'Fiber, total dietary',
		unit: 'g',
		category: 'macronutrient'
	},
	WATER: { code: 'WATER', namePl: 'Woda', nameEn: 'Water', unit: 'g', category: 'macronutrient' },
	ASH: { code: 'ASH', namePl: 'Popiół', nameEn: 'Ash', unit: 'g', category: 'macronutrient' },

	// Minerals
	CA: { code: 'CA', namePl: 'Wapń', nameEn: 'Calcium', unit: 'mg', category: 'mineral' },
	FE: { code: 'FE', namePl: 'Żelazo', nameEn: 'Iron', unit: 'mg', category: 'mineral' },
	MG: { code: 'MG', namePl: 'Magnez', nameEn: 'Magnesium', unit: 'mg', category: 'mineral' },
	P: { code: 'P', namePl: 'Fosfor', nameEn: 'Phosphorus', unit: 'mg', category: 'mineral' },
	K: { code: 'K', namePl: 'Potas', nameEn: 'Potassium', unit: 'mg', category: 'mineral' },
	NA: { code: 'NA', namePl: 'Sód', nameEn: 'Sodium', unit: 'mg', category: 'mineral' },
	ZN: { code: 'ZN', namePl: 'Cynk', nameEn: 'Zinc', unit: 'mg', category: 'mineral' },
	CU: { code: 'CU', namePl: 'Miedź', nameEn: 'Copper', unit: 'mg', category: 'mineral' },
	MN: { code: 'MN', namePl: 'Mangan', nameEn: 'Manganese', unit: 'mg', category: 'mineral' },
	SE: { code: 'SE', namePl: 'Selen', nameEn: 'Selenium', unit: 'µg', category: 'mineral' },
	ID: { code: 'ID', namePl: 'Jod', nameEn: 'Iodine', unit: 'µg', category: 'mineral' },

	// Vitamins
	VITA_RAE: {
		code: 'VITA_RAE',
		namePl: 'Witamina A (RAE)',
		nameEn: 'Vitamin A, RAE',
		unit: 'µg',
		category: 'vitamin'
	},
	RETOL: { code: 'RETOL', namePl: 'Retinol', nameEn: 'Retinol', unit: 'µg', category: 'vitamin' },
	CARTB: {
		code: 'CARTB',
		namePl: 'Karoten beta',
		nameEn: 'Carotene, beta',
		unit: 'µg',
		category: 'vitamin'
	},
	VITC: {
		code: 'VITC',
		namePl: 'Witamina C',
		nameEn: 'Vitamin C, total ascorbic acid',
		unit: 'mg',
		category: 'vitamin'
	},
	VITD: {
		code: 'VITD',
		namePl: 'Witamina D (D2 + D3)',
		nameEn: 'Vitamin D (D2 + D3)',
		unit: 'µg',
		category: 'vitamin'
	},
	TOCPHA: {
		code: 'TOCPHA',
		namePl: 'Witamina E (alfa-tokoferol)',
		nameEn: 'Vitamin E (alpha-tocopherol)',
		unit: 'mg',
		category: 'vitamin'
	},
	VITK1: {
		code: 'VITK1',
		namePl: 'Witamina K (filochinon)',
		nameEn: 'Vitamin K (phylloquinone)',
		unit: 'µg',
		category: 'vitamin'
	},
	THIA: {
		code: 'THIA',
		namePl: 'Tiamina (witamina B1)',
		nameEn: 'Thiamin',
		unit: 'mg',
		category: 'vitamin'
	},
	RIBF: {
		code: 'RIBF',
		namePl: 'Ryboflawina (witamina B2)',
		nameEn: 'Riboflavin',
		unit: 'mg',
		category: 'vitamin'
	},
	NIA: {
		code: 'NIA',
		namePl: 'Niacyna (witamina B3)',
		nameEn: 'Niacin',
		unit: 'mg',
		category: 'vitamin'
	},
	PANTAC: {
		code: 'PANTAC',
		namePl: 'Kwas pantotenowy (witamina B5)',
		nameEn: 'Pantothenic acid',
		unit: 'mg',
		category: 'vitamin'
	},
	VITB6A: {
		code: 'VITB6A',
		namePl: 'Witamina B6',
		nameEn: 'Vitamin B-6',
		unit: 'mg',
		category: 'vitamin'
	},
	BIOT: {
		code: 'BIOT',
		namePl: 'Biotyna (witamina B7)',
		nameEn: 'Biotin',
		unit: 'µg',
		category: 'vitamin'
	},
	FOL: {
		code: 'FOL',
		namePl: 'Foliany ogółem',
		nameEn: 'Folate, total',
		unit: 'µg',
		category: 'vitamin'
	},
	VITB12: {
		code: 'VITB12',
		namePl: 'Witamina B12',
		nameEn: 'Vitamin B-12',
		unit: 'µg',
		category: 'vitamin'
	},

	// Amino Acids
	ALA: { code: 'ALA', namePl: 'Alanina', nameEn: 'Alanine', unit: 'g', category: 'amino_acid' },
	ARG: { code: 'ARG', namePl: 'Arginina', nameEn: 'Arginine', unit: 'g', category: 'amino_acid' },
	ASP: {
		code: 'ASP',
		namePl: 'Kwas asparaginowy',
		nameEn: 'Aspartic acid',
		unit: 'g',
		category: 'amino_acid'
	},
	CYS: { code: 'CYS', namePl: 'Cysteina', nameEn: 'Cysteine', unit: 'g', category: 'amino_acid' },
	GLU: {
		code: 'GLU',
		namePl: 'Kwas glutaminowy',
		nameEn: 'Glutamic acid',
		unit: 'g',
		category: 'amino_acid'
	},
	GLY: { code: 'GLY', namePl: 'Glicyna', nameEn: 'Glycine', unit: 'g', category: 'amino_acid' },
	HIS: { code: 'HIS', namePl: 'Histydyna', nameEn: 'Histidine', unit: 'g', category: 'amino_acid' },
	ILE: {
		code: 'ILE',
		namePl: 'Izoleucyna',
		nameEn: 'Isoleucine',
		unit: 'g',
		category: 'amino_acid'
	},
	LEU: { code: 'LEU', namePl: 'Leucyna', nameEn: 'Leucine', unit: 'g', category: 'amino_acid' },
	LYS: { code: 'LYS', namePl: 'Lizyna', nameEn: 'Lysine', unit: 'g', category: 'amino_acid' },
	MET: { code: 'MET', namePl: 'Metionina', nameEn: 'Methionine', unit: 'g', category: 'amino_acid' },
	PHE: {
		code: 'PHE',
		namePl: 'Fenyloalanina',
		nameEn: 'Phenylalanine',
		unit: 'g',
		category: 'amino_acid'
	},
	PRO: { code: 'PRO', namePl: 'Prolina', nameEn: 'Proline', unit: 'g', category: 'amino_acid' },
	SER: { code: 'SER', namePl: 'Seryna', nameEn: 'Serine', unit: 'g', category: 'amino_acid' },
	THR: { code: 'THR', namePl: 'Treonina', nameEn: 'Threonine', unit: 'g', category: 'amino_acid' },
	TRP: { code: 'TRP', namePl: 'Tryptofan', nameEn: 'Tryptophan', unit: 'g', category: 'amino_acid' },
	TYR: { code: 'TYR', namePl: 'Tyrozyna', nameEn: 'Tyrosine', unit: 'g', category: 'amino_acid' },
	VAL: { code: 'VAL', namePl: 'Walina', nameEn: 'Valine', unit: 'g', category: 'amino_acid' },

	// Fatty Acids Summary
	FASAT: {
		code: 'FASAT',
		namePl: 'Kwasy tłuszczowe nasycone',
		nameEn: 'Fatty acids, total saturated',
		unit: 'g',
		category: 'fatty_acid'
	},
	FAMS: {
		code: 'FAMS',
		namePl: 'Kwasy tłuszczowe jednonienasycone',
		nameEn: 'Fatty acids, total monounsaturated',
		unit: 'g',
		category: 'fatty_acid'
	},
	FAPU: {
		code: 'FAPU',
		namePl: 'Kwasy tłuszczowe wielonienasycone',
		nameEn: 'Fatty acids, total polyunsaturated',
		unit: 'g',
		category: 'fatty_acid'
	},
	FATRN: {
		code: 'FATRN',
		namePl: 'Kwasy tłuszczowe trans',
		nameEn: 'Fatty acids, total trans',
		unit: 'g',
		category: 'fatty_acid'
	},

	// Important PUFAs
	F18D3N3: {
		code: 'F18D3N3',
		namePl: 'Kwas alfa-linolenowy (ALA)',
		nameEn: 'PUFA 18:3 n-3 (ALA)',
		unit: 'g',
		category: 'fatty_acid'
	},
	F20D5N3: {
		code: 'F20D5N3',
		namePl: 'Kwas eikozapentaenowy (EPA)',
		nameEn: 'PUFA 20:5 n-3 (EPA)',
		unit: 'g',
		category: 'fatty_acid'
	},
	F22D6N3: {
		code: 'F22D6N3',
		namePl: 'Kwas dokozaheksaenowy (DHA)',
		nameEn: 'PUFA 22:6 n-3 (DHA)',
		unit: 'g',
		category: 'fatty_acid'
	},

	// Sterols
	CHOLE: { code: 'CHOLE', namePl: 'Cholesterol', nameEn: 'Cholesterol', unit: 'mg', category: 'sterol' },

	// Sugars
	FRUS: { code: 'FRUS', namePl: 'Fruktoza', nameEn: 'Fructose', unit: 'g', category: 'sugar' },
	GLUS: { code: 'GLUS', namePl: 'Glukoza', nameEn: 'Glucose', unit: 'g', category: 'sugar' },
	LACS: { code: 'LACS', namePl: 'Laktoza', nameEn: 'Lactose', unit: 'g', category: 'sugar' },
	MALS: { code: 'MALS', namePl: 'Maltoza', nameEn: 'Maltose', unit: 'g', category: 'sugar' },
	SUCS: { code: 'SUCS', namePl: 'Sacharoza', nameEn: 'Sucrose', unit: 'g', category: 'sugar' },
	SUGAR: { code: 'SUGAR', namePl: 'Cukry ogółem', nameEn: 'Sugars, Total', unit: 'g', category: 'sugar' },

	// Other
	CHOLN: {
		code: 'CHOLN',
		namePl: 'Cholina ogółem',
		nameEn: 'Choline, total',
		unit: 'mg',
		category: 'other'
	},
	BETN: { code: 'BETN', namePl: 'Betaina', nameEn: 'Betaine', unit: 'mg', category: 'other' }
};

/**
 * Get nutrient info by INFOODS code
 * Returns undefined if code not found in registry
 */
export function getNutrientInfo(code: string): NutrientInfo | undefined {
	return NUTRIENTS[code];
}

/**
 * Get nutrient name in specified language
 */
export function getNutrientName(code: string, lang: 'pl' | 'en' = 'pl'): string {
	const info = NUTRIENTS[code];
	if (!info) return code;
	return lang === 'pl' ? info.namePl : info.nameEn;
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
