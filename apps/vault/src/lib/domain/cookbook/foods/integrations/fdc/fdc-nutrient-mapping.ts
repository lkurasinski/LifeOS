/**
 * Mapping from FDC nutrient IDs to INFOODS tagname codes
 *
 * FDC (FoodData Central) uses numeric IDs for nutrients.
 * We normalize these to INFOODS standard codes for consistency.
 *
 * Source: USDA FoodData Central API documentation
 * https://fdc.nal.usda.gov/api-guide.html
 */

export const FDC_TO_INFOODS: Record<number, string> = {
	// Energy
	1008: 'ENERC_KCAL', // Energy (kcal)
	1062: 'ENERC_KJ', // Energy (kJ)

	// Macronutrients
	1003: 'PROT', // Protein
	1004: 'FAT', // Total lipid (fat)
	1005: 'CHOCDF', // Carbohydrate, by difference
	1079: 'FIBTG', // Fiber, total dietary
	1051: 'WATER', // Water
	1007: 'ASH', // Ash

	// Minerals
	1087: 'CA', // Calcium, Ca
	1089: 'FE', // Iron, Fe
	1090: 'MG', // Magnesium, Mg
	1091: 'P', // Phosphorus, P
	1092: 'K', // Potassium, K
	1093: 'NA', // Sodium, Na
	1095: 'ZN', // Zinc, Zn
	1098: 'CU', // Copper, Cu
	1101: 'MN', // Manganese, Mn
	1103: 'SE', // Selenium, Se

	// Vitamins
	1106: 'VITA_RAE', // Vitamin A, RAE
	1105: 'RETOL', // Retinol
	1107: 'CARTB', // Carotene, beta
	1162: 'VITC', // Vitamin C, total ascorbic acid
	1114: 'VITD', // Vitamin D (D2 + D3)
	1109: 'TOCPHA', // Vitamin E (alpha-tocopherol)
	1185: 'VITK1', // Vitamin K (phylloquinone)
	1165: 'THIA', // Thiamin
	1166: 'RIBF', // Riboflavin
	1167: 'NIA', // Niacin
	1170: 'PANTAC', // Pantothenic acid
	1175: 'VITB6A', // Vitamin B-6
	1177: 'FOL', // Folate, total
	1178: 'VITB12', // Vitamin B-12

	// Amino Acids
	1221: 'ALA', // Alanine
	1220: 'ARG', // Arginine
	1222: 'ASP', // Aspartic acid
	1216: 'CYS', // Cysteine
	1223: 'GLU', // Glutamic acid
	1224: 'GLY', // Glycine
	1212: 'HIS', // Histidine
	1213: 'ILE', // Isoleucine
	1214: 'LEU', // Leucine
	1215: 'LYS', // Lysine
	1217: 'MET', // Methionine
	1218: 'PHE', // Phenylalanine
	1225: 'PRO', // Proline
	1226: 'SER', // Serine
	1211: 'THR', // Threonine
	1210: 'TRP', // Tryptophan
	1219: 'TYR', // Tyrosine
	1227: 'VAL', // Valine

	// Fatty Acids
	1258: 'FASAT', // Fatty acids, total saturated
	1292: 'FAMS', // Fatty acids, total monounsaturated
	1293: 'FAPU', // Fatty acids, total polyunsaturated
	1257: 'FATRN', // Fatty acids, total trans

	// Important PUFAs
	1404: 'F18D3N3', // PUFA 18:3 n-3 (ALA)
	1278: 'F20D5N3', // PUFA 20:5 n-3 (EPA)
	1272: 'F22D6N3', // PUFA 22:6 n-3 (DHA)

	// Sterols
	1253: 'CHOLE', // Cholesterol

	// Sugars
	1072: 'SUGAR', // Sugars, Total
	1010: 'SUCS', // Sucrose
	1011: 'GLUS', // Glucose
	1012: 'FRUS', // Fructose
	1013: 'LACS', // Lactose
	1014: 'MALS', // Maltose

	// Other
	1180: 'CHOLN', // Choline, total
	1194: 'BETN' // Betaine
};

/**
 * Get FDC nutrient ID from INFOODS code
 * Returns undefined if no mapping exists
 */
export function infoodsToFdcNutrient(infoodsCode: string): number | undefined {
	const entry = Object.entries(FDC_TO_INFOODS).find(([, code]) => code === infoodsCode);
	return entry ? Number(entry[0]) : undefined;
}
