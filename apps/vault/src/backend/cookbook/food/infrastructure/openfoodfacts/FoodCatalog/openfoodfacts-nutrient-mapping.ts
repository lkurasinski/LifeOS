/**
 * OpenFoodFacts to INFOODS Nutrient Mapping
 *
 * Maps OpenFoodFacts nutrient field names to INFOODS tagnames
 */

export const OFF_TO_INFOODS: Record<string, string> = {
	// Energy
	'energy-kcal_100g': 'ENERC_AGF_kcal',
	'energy-kj_100g': 'ENERA_kJ',

	// Macronutrients
	fat: 'FAT_g',
	'saturated-fat': 'FASAT_g',
	'monounsaturated-fat': 'FAMS_g',
	'polyunsaturated-fat': 'FAPU_g',
	'trans-fat': 'FATRN_g',
	cholesterol: 'CHOLE_mg',

	carbohydrates_100g: 'CHOCDF_g',
	sugars_100g: 'SUGAR_g',
	fiber_100g: 'FIBTG_g',

	proteins_100g: 'PROTCNT_g',

	// Minerals
	salt_100g: 'NACL_g',
	sodium_100g: 'NA_mg',
	calcium_100g: 'CA_mg',
	iron_100g: 'FE_mg',
	magnesium_100g: 'MG_mg',
	phosphorus_100g: 'P_mg',
	potassium_100g: 'K_mg',
	zinc_100g: 'ZN_mg',
	copper_100g: 'CU_mg',
	manganese_100g: 'MN_mg',
	selenium_100g: 'SE_mcg',
	iodine_100g: 'ID_mcg',

	// Vitamins
	'vitamin-a_100g': 'VITA_RAE_mcg',
	'vitamin-d_100g': 'VITD_mcg',
	'vitamin-e_100g': 'VITE_mg',
	'vitamin-k_100g': 'VITK_mcg',
	'vitamin-c_100g': 'VITC_mg',
	'vitamin-b1_100g': 'THIA_mg',
	'vitamin-b2_100g': 'RIBF_mg',
	'vitamin-b3_100g': 'NIA_mg',
	'vitamin-b6_100g': 'VITB6_mg',
	'vitamin-b9_100g': 'FOL_mcg',
	'vitamin-b12_100g': 'VITB12_mcg',
	biotin_100g: 'BIOT_mcg',
	'pantothenic-acid_100g': 'PANTAC_mg'
};
