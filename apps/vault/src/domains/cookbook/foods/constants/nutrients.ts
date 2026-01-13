/**
 * INFOODS Tagname nutrient information
 * Contains all nutrients with Polish/English names and units
 *
 * Based on INFOODS (International Food Data Systems) standard
 * https://www.fao.org/infoods/infoods/standards-guidelines/en/
 */

import type { Nutrient } from '$domains/cookbook/foods';

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
	// Energy (INFOODS/GS1: ENERA, ENERC...)[web:33][web:37]
	ENERA_kcal: {
		code: 'ENERA_kcal',
		name_pl: 'Energia (analizowana)',
		name_en: 'Energy (analysed)',
		unit: 'kcal',
		category: 'energy'
	},
	ENERA_kJ: {
		code: 'ENERA_kJ',
		name_pl: 'Energia (analizowana)',
		name_en: 'Energy (analysed)',
		unit: 'kJ',
		category: 'energy'
	},
	ENERC_AGF_kcal: {
		code: 'ENERC_AGF_kcal',
		name_pl: 'Energia (Atwater – współczynniki ogólne)',
		name_en: 'Metabolizable energy (Atwater general factors)',
		unit: 'kcal',
		category: 'energy'
	},
	ENERC_ASF_kcal: {
		code: 'ENERC_ASF_kcal',
		name_pl: 'Energia (Atwater – współczynniki specyficzne)',
		name_en: 'Metabolizable energy (Atwater specific factors)',
		unit: 'kcal',
		category: 'energy'
	},

	// Macronutrients (g)[web:40][web:43]
	NT_g: { code: 'NT_g', name_pl: 'Azot', name_en: 'Nitrogen, total', unit: 'g', category: 'other' },
	PROTCNT_g: {
		code: 'PROTCNT_g',
		name_pl: 'Białko (z azotu)',
		name_en: 'Protein, total (from nitrogen)',
		unit: 'g',
		category: 'macronutrient'
	},
	FAT_g: {
		code: 'FAT_g',
		name_pl: 'Tłuszcz ogółem',
		name_en: 'Total lipid (fat)',
		unit: 'g',
		category: 'macronutrient'
	},
	CHOCDF_g: {
		code: 'CHOCDF_g',
		name_pl: 'Węglowodany (różnicą)',
		name_en: 'Carbohydrate, by difference',
		unit: 'g',
		category: 'macronutrient'
	},
	CHOAVL_g: {
		code: 'CHOAVL_g',
		name_pl: 'Węglowodany przyswajalne',
		name_en: 'Available carbohydrate, by summation',
		unit: 'g',
		category: 'macronutrient'
	},
	FIBTG_g: {
		code: 'FIBTG_g',
		name_pl: 'Błonnik pokarmowy ogółem',
		name_en: 'Dietary fibre, total',
		unit: 'g',
		category: 'macronutrient'
	},
	FIBTGLCS_g: {
		code: 'FIBTGLCS_g',
		name_pl: 'Błonnik pokarmowy (AOAC 2011.25)',
		name_en: 'Dietary fibre (AOAC 2011.25)',
		unit: 'g',
		category: 'macronutrient'
	},
	WATER_g: {
		code: 'WATER_g',
		name_pl: 'Woda',
		name_en: 'Water',
		unit: 'g',
		category: 'macronutrient'
	},
	ASH_g: { code: 'ASH_g', name_pl: 'Popiół', name_en: 'Ash', unit: 'g', category: 'macronutrient' },
	STARCH_g: {
		code: 'STARCH_g',
		name_pl: 'Skrobia',
		name_en: 'Starch',
		unit: 'g',
		category: 'carbohydrate'
	},
	STARES_g: {
		code: 'STARES_g',
		name_pl: 'Skrobia oporna',
		name_en: 'Resistant starch',
		unit: 'g',
		category: 'carbohydrate'
	},

	// Sugars (g)[web:40]
	SUGAR_g: {
		code: 'SUGAR_g',
		name_pl: 'Cukry ogółem',
		name_en: 'Sugars, total',
		unit: 'g',
		category: 'sugar'
	},
	SUCS_g: {
		code: 'SUCS_g',
		name_pl: 'Sacharoza',
		name_en: 'Sucrose',
		unit: 'g',
		category: 'sugar'
	},
	GLUS_g: { code: 'GLUS_g', name_pl: 'Glukoza', name_en: 'Glucose', unit: 'g', category: 'sugar' },
	FRUS_g: {
		code: 'FRUS_g',
		name_pl: 'Fruktoza',
		name_en: 'Fructose',
		unit: 'g',
		category: 'sugar'
	},
	LACS_g: { code: 'LACS_g', name_pl: 'Laktoza', name_en: 'Lactose', unit: 'g', category: 'sugar' },
	MALS_g: { code: 'MALS_g', name_pl: 'Maltoza', name_en: 'Maltose', unit: 'g', category: 'sugar' },
	GALS_g: {
		code: 'GALS_g',
		name_pl: 'Galaktoza',
		name_en: 'Galactose',
		unit: 'g',
		category: 'sugar'
	},
	RAFS_g: {
		code: 'RAFS_g',
		name_pl: 'Rafinoza',
		name_en: 'Raffinose',
		unit: 'g',
		category: 'sugar'
	},
	STAS_g: {
		code: 'STAS_g',
		name_pl: 'Stachioza',
		name_en: 'Stachyose',
		unit: 'g',
		category: 'sugar'
	},
	VERS_g: {
		code: 'VERS_g',
		name_pl: 'Werbaskoza',
		name_en: 'Verbascose',
		unit: 'g',
		category: 'sugar'
	},
	GLUCNB_g: {
		code: 'GLUCNB_g',
		name_pl: 'Beta-glukan',
		name_en: 'Beta-glucan',
		unit: 'g',
		category: 'fiber'
	},

	// Minerals (mg / µg)[web:31][web:40]
	CA_mg: { code: 'CA_mg', name_pl: 'Wapń', name_en: 'Calcium', unit: 'mg', category: 'mineral' },
	FE_mg: { code: 'FE_mg', name_pl: 'Żelazo', name_en: 'Iron', unit: 'mg', category: 'mineral' },
	MG_mg: {
		code: 'MG_mg',
		name_pl: 'Magnez',
		name_en: 'Magnesium',
		unit: 'mg',
		category: 'mineral'
	},
	P_mg: { code: 'P_mg', name_pl: 'Fosfor', name_en: 'Phosphorus', unit: 'mg', category: 'mineral' },
	K_mg: { code: 'K_mg', name_pl: 'Potas', name_en: 'Potassium', unit: 'mg', category: 'mineral' },
	NA_mg: { code: 'NA_mg', name_pl: 'Sód', name_en: 'Sodium', unit: 'mg', category: 'mineral' },
	ZN_mg: { code: 'ZN_mg', name_pl: 'Cynk', name_en: 'Zinc', unit: 'mg', category: 'mineral' },
	CU_mg: { code: 'CU_mg', name_pl: 'Miedź', name_en: 'Copper', unit: 'mg', category: 'mineral' },
	MN_mg: {
		code: 'MN_mg',
		name_pl: 'Mangan',
		name_en: 'Manganese',
		unit: 'mg',
		category: 'mineral'
	},
	ID_mcg: { code: 'ID_mcg', name_pl: 'Jod', name_en: 'Iodine', unit: 'µg', category: 'mineral' },
	MO_mcg: {
		code: 'MO_mcg',
		name_pl: 'Molibden',
		name_en: 'Molybdenum',
		unit: 'µg',
		category: 'mineral'
	},
	SE_mcg: {
		code: 'SE_mcg',
		name_pl: 'Selen',
		name_en: 'Selenium',
		unit: 'µg',
		category: 'mineral'
	},
	S_mg: { code: 'S_mg', name_pl: 'Siarka', name_en: 'Sulfur', unit: 'mg', category: 'mineral' },
	CO_mcg: { code: 'CO_mcg', name_pl: 'Kobalt', name_en: 'Cobalt', unit: 'µg', category: 'mineral' },
	B_mcg: { code: 'B_mcg', name_pl: 'Bor', name_en: 'Boron', unit: 'µg', category: 'mineral' },
	NI_mcg: { code: 'NI_mcg', name_pl: 'Nikiel', name_en: 'Nickel', unit: 'µg', category: 'mineral' },

	// Vitamins & carotenoids[web:39][web:42][web:45]
	VITA_RAE_mcg: {
		code: 'VITA_RAE_mcg',
		name_pl: 'Witamina A (RAE)',
		name_en: 'Vitamin A, RAE',
		unit: 'µg',
		category: 'vitamin'
	},
	VITA_mcg: {
		code: 'VITA_mcg',
		name_pl: 'Witamina A',
		name_en: 'Vitamin A',
		unit: 'µg',
		category: 'vitamin'
	},
	RETOL_mcg: {
		code: 'RETOL_mcg',
		name_pl: 'Retinol',
		name_en: 'Retinol',
		unit: 'µg',
		category: 'vitamin'
	},
	CARTB_mcg: {
		code: 'CARTB_mcg',
		name_pl: 'Beta-karoten',
		name_en: 'Beta-carotene',
		unit: 'µg',
		category: 'vitamin'
	},
	CARTA_mcg: {
		code: 'CARTA_mcg',
		name_pl: 'Alfa-karoten',
		name_en: 'Alpha-carotene',
		unit: 'µg',
		category: 'vitamin'
	},
	CRYPXB_mcg: {
		code: 'CRYPXB_mcg',
		name_pl: 'Beta-kryptoksantyna',
		name_en: 'Beta-cryptoxanthin',
		unit: 'µg',
		category: 'vitamin'
	},
	CRYPXA_mcg: {
		code: 'CRYPXA_mcg',
		name_pl: 'Alfa-kryptoksantyna',
		name_en: 'Alpha-cryptoxanthin',
		unit: 'µg',
		category: 'vitamin'
	},
	LUTN_mcg: {
		code: 'LUTN_mcg',
		name_pl: 'Luteina',
		name_en: 'Lutein',
		unit: 'µg',
		category: 'vitamin'
	},
	ZEA_mcg: {
		code: 'ZEA_mcg',
		name_pl: 'Zeksantyna',
		name_en: 'Zeaxanthin',
		unit: 'µg',
		category: 'vitamin'
	},
	LUTNZEA_mcg: {
		code: 'LUTNZEA_mcg',
		name_pl: 'Luteina + zeksantyna',
		name_en: 'Lutein + zeaxanthin',
		unit: 'µg',
		category: 'vitamin'
	},
	LYCPN_mcg: {
		code: 'LYCPN_mcg',
		name_pl: 'Likopen',
		name_en: 'Lycopene',
		unit: 'µg',
		category: 'vitamin'
	},

	VITC_mg: {
		code: 'VITC_mg',
		name_pl: 'Witamina C',
		name_en: 'Vitamin C, total ascorbic acid',
		unit: 'mg',
		category: 'vitamin'
	},

	VITD_IU: {
		code: 'VITD_IU',
		name_pl: 'Witamina D (IU)',
		name_en: 'Vitamin D (D2+D3), IU',
		unit: 'IU',
		category: 'vitamin'
	},
	ERGCAL_mcg: {
		code: 'ERGCAL_mcg',
		name_pl: 'Ergokalcyferol (D2)',
		name_en: 'Ergocalciferol (D2)',
		unit: 'µg',
		category: 'vitamin'
	},
	CHOCALOH_mcg: {
		code: 'CHOCALOH_mcg',
		name_pl: 'Cholekalcyferol (D3)',
		name_en: 'Cholecalciferol (D3)',
		unit: 'µg',
		category: 'vitamin'
	},
	VITD_mcg: {
		code: 'VITD_mcg',
		name_pl: 'Witamina D (D2 + D3)',
		name_en: 'Vitamin D (D2 + D3)',
		unit: 'µg',
		category: 'vitamin'
	},
	CHOCAL_mcg: {
		code: 'CHOCAL_mcg',
		name_pl: '25-hydroksycholekalcyferol',
		name_en: '25-hydroxycholecalciferol',
		unit: 'µg',
		category: 'vitamin'
	},

	TOCPHA_mg: {
		code: 'TOCPHA_mg',
		name_pl: 'Witamina E (alfa-tokoferol)',
		name_en: 'Alpha-tocopherol',
		unit: 'mg',
		category: 'vitamin'
	},
	TOCPHB_mg: {
		code: 'TOCPHB_mg',
		name_pl: 'Beta-tokoferol',
		name_en: 'Beta-tocopherol',
		unit: 'mg',
		category: 'vitamin'
	},
	TOCPHG_mg: {
		code: 'TOCPHG_mg',
		name_pl: 'Gamma-tokoferol',
		name_en: 'Gamma-tocopherol',
		unit: 'mg',
		category: 'vitamin'
	},
	TOCPHD_mg: {
		code: 'TOCPHD_mg',
		name_pl: 'Delta-tokoferol',
		name_en: 'Delta-tocopherol',
		unit: 'mg',
		category: 'vitamin'
	},
	TOCTRA_mg: {
		code: 'TOCTRA_mg',
		name_pl: 'Alfa-tokotrienol',
		name_en: 'Alpha-tocotrienol',
		unit: 'mg',
		category: 'vitamin'
	},
	TOCTRB_mg: {
		code: 'TOCTRB_mg',
		name_pl: 'Beta-tokotrienol',
		name_en: 'Beta-tocotrienol',
		unit: 'mg',
		category: 'vitamin'
	},
	TOCTRG_mg: {
		code: 'TOCTRG_mg',
		name_pl: 'Gamma-tokotrienol',
		name_en: 'Gamma-tocotrienol',
		unit: 'mg',
		category: 'vitamin'
	},
	TOCTRD_mg: {
		code: 'TOCTRD_mg',
		name_pl: 'Delta-tokotrienol',
		name_en: 'Delta-tocotrienol',
		unit: 'mg',
		category: 'vitamin'
	},

	VITK1_mcg: {
		code: 'VITK1_mcg',
		name_pl: 'Witamina K1 (filochinon)',
		name_en: 'Vitamin K1 (phylloquinone)',
		unit: 'µg',
		category: 'vitamin'
	},
	VITK2_mcg: {
		code: 'VITK2_mcg',
		name_pl: 'Witamina K2 (dihydrof.',
		name_en: 'Vitamin K (dihydrophylloquinone)',
		unit: 'µg',
		category: 'vitamin'
	},
	VITK3_mcg: {
		code: 'VITK3_mcg',
		name_pl: 'Witamina K (MK-4)',
		name_en: 'Vitamin K (menaquinone-4)',
		unit: 'µg',
		category: 'vitamin'
	},

	THIA_mg: {
		code: 'THIA_mg',
		name_pl: 'Tiamina (B1)',
		name_en: 'Thiamin',
		unit: 'mg',
		category: 'vitamin'
	},
	RIBF_mg: {
		code: 'RIBF_mg',
		name_pl: 'Ryboflawina (B2)',
		name_en: 'Riboflavin',
		unit: 'mg',
		category: 'vitamin'
	},
	NIA_mg: {
		code: 'NIA_mg',
		name_pl: 'Niacyna (B3)',
		name_en: 'Niacin',
		unit: 'mg',
		category: 'vitamin'
	},
	PANTAC_mg: {
		code: 'PANTAC_mg',
		name_pl: 'Kwas pantotenowy (B5)',
		name_en: 'Pantothenic acid',
		unit: 'mg',
		category: 'vitamin'
	},
	VITB6A_mg: {
		code: 'VITB6A_mg',
		name_pl: 'Witamina B6',
		name_en: 'Vitamin B-6',
		unit: 'mg',
		category: 'vitamin'
	},
	BIOT_mcg: {
		code: 'BIOT_mcg',
		name_pl: 'Biotyna (B7)',
		name_en: 'Biotin',
		unit: 'µg',
		category: 'vitamin'
	},
	FOL_mcg: {
		code: 'FOL_mcg',
		name_pl: 'Foliany ogółem',
		name_en: 'Folate, total',
		unit: 'µg',
		category: 'vitamin'
	},
	FOLH4FM5_mcg: {
		code: 'FOLH4FM5_mcg',
		name_pl: '5-metylotetrahydrofolian',
		name_en: '5-methyl-THF',
		unit: 'µg',
		category: 'vitamin'
	},
	FOLFM10_mcg: {
		code: 'FOLFM10_mcg',
		name_pl: '10-formylokwas foliowy',
		name_en: '10-formyl folic acid',
		unit: 'µg',
		category: 'vitamin'
	},
	FOLH4ME5_mcg: {
		code: 'FOLH4ME5_mcg',
		name_pl: '5-formylotetrahydrofolian',
		name_en: '5-formyl-THF',
		unit: 'µg',
		category: 'vitamin'
	},
	VITB12_mcg: {
		code: 'VITB12_mcg',
		name_pl: 'Witamina B12',
		name_en: 'Vitamin B-12',
		unit: 'µg',
		category: 'vitamin'
	},

	// Amino acids (mg)[web:31]
	ALA_mg: {
		code: 'ALA_mg',
		name_pl: 'Alanina',
		name_en: 'Alanine',
		unit: 'mg',
		category: 'amino_acid'
	},
	ARG_mg: {
		code: 'ARG_mg',
		name_pl: 'Arginina',
		name_en: 'Arginine',
		unit: 'mg',
		category: 'amino_acid'
	},
	ASP_mg: {
		code: 'ASP_mg',
		name_pl: 'Kwas asparaginowy',
		name_en: 'Aspartic acid',
		unit: 'mg',
		category: 'amino_acid'
	},
	CYS_mg: {
		code: 'CYS_mg',
		name_pl: 'Cysteina',
		name_en: 'Cystine/Cysteine',
		unit: 'mg',
		category: 'amino_acid'
	},
	CYSTE_mg: {
		code: 'CYSTE_mg',
		name_pl: 'Cysteina (wolna)',
		name_en: 'Cysteine',
		unit: 'mg',
		category: 'amino_acid'
	},
	GLU_mg: {
		code: 'GLU_mg',
		name_pl: 'Kwas glutaminowy',
		name_en: 'Glutamic acid',
		unit: 'mg',
		category: 'amino_acid'
	},
	GLY_mg: {
		code: 'GLY_mg',
		name_pl: 'Glicyna',
		name_en: 'Glycine',
		unit: 'mg',
		category: 'amino_acid'
	},
	HYP_mg: {
		code: 'HYP_mg',
		name_pl: 'Hydroksyprolina',
		name_en: 'Hydroxyproline',
		unit: 'mg',
		category: 'amino_acid'
	},
	HIS_mg: {
		code: 'HIS_mg',
		name_pl: 'Histydyna',
		name_en: 'Histidine',
		unit: 'mg',
		category: 'amino_acid'
	},
	ILE_mg: {
		code: 'ILE_mg',
		name_pl: 'Izoleucyna',
		name_en: 'Isoleucine',
		unit: 'mg',
		category: 'amino_acid'
	},
	LEU_mg: {
		code: 'LEU_mg',
		name_pl: 'Leucyna',
		name_en: 'Leucine',
		unit: 'mg',
		category: 'amino_acid'
	},
	LYS_mg: {
		code: 'LYS_mg',
		name_pl: 'Lizyna',
		name_en: 'Lysine',
		unit: 'mg',
		category: 'amino_acid'
	},
	MET_mg: {
		code: 'MET_mg',
		name_pl: 'Metionina',
		name_en: 'Methionine',
		unit: 'mg',
		category: 'amino_acid'
	},
	PHE_mg: {
		code: 'PHE_mg',
		name_pl: 'Fenyloalanina',
		name_en: 'Phenylalanine',
		unit: 'mg',
		category: 'amino_acid'
	},
	PRO_mg: {
		code: 'PRO_mg',
		name_pl: 'Prolina',
		name_en: 'Proline',
		unit: 'mg',
		category: 'amino_acid'
	},
	SER_mg: {
		code: 'SER_mg',
		name_pl: 'Seryna',
		name_en: 'Serine',
		unit: 'mg',
		category: 'amino_acid'
	},
	THR_mg: {
		code: 'THR_mg',
		name_pl: 'Treonina',
		name_en: 'Threonine',
		unit: 'mg',
		category: 'amino_acid'
	},
	TRP_mg: {
		code: 'TRP_mg',
		name_pl: 'Tryptofan',
		name_en: 'Tryptophan',
		unit: 'mg',
		category: 'amino_acid'
	},
	TYR_mg: {
		code: 'TYR_mg',
		name_pl: 'Tyrozyna',
		name_en: 'Tyrosine',
		unit: 'mg',
		category: 'amino_acid'
	},
	VAL_mg: {
		code: 'VAL_mg',
		name_pl: 'Walina',
		name_en: 'Valine',
		unit: 'mg',
		category: 'amino_acid'
	},

	// Fatty acids totals (g)[web:31]
	FASAT_g: {
		code: 'FASAT_g',
		name_pl: 'Kwasy tłuszczowe nasycone',
		name_en: 'Fatty acids, total saturated',
		unit: 'g',
		category: 'fatty_acid'
	},
	FAMS_g: {
		code: 'FAMS_g',
		name_pl: 'Kwasy tł. jednonienasycone',
		name_en: 'Fatty acids, total monounsaturated',
		unit: 'g',
		category: 'fatty_acid'
	},
	FAPU_g: {
		code: 'FAPU_g',
		name_pl: 'Kwasy tł. wielonienasycone',
		name_en: 'Fatty acids, total polyunsaturated',
		unit: 'g',
		category: 'fatty_acid'
	},
	FATRN_g: {
		code: 'FATRN_g',
		name_pl: 'Kwasy tłuszczowe trans',
		name_en: 'Fatty acids, total trans',
		unit: 'g',
		category: 'fatty_acid'
	},

	// SFA (g)
	SFA_4D0_g: {
		code: 'SFA_4D0_g',
		name_pl: 'Kwas masłowy (4:0)',
		name_en: 'Butyric acid (4:0)',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_6D0_g: {
		code: 'SFA_6D0_g',
		name_pl: 'Kwas kapronowy (6:0)',
		name_en: 'Caproic acid (6:0)',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_8D0_g: {
		code: 'SFA_8D0_g',
		name_pl: 'Kwas kaprylowy (8:0)',
		name_en: 'Caprylic acid (8:0)',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_10D0_g: {
		code: 'SFA_10D0_g',
		name_pl: 'Kwas kaprynowy (10:0)',
		name_en: 'Capric acid (10:0)',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_11D0_g: {
		code: 'SFA_11D0_g',
		name_pl: 'SFA 11:0',
		name_en: 'SFA 11:0',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_12D0_g: {
		code: 'SFA_12D0_g',
		name_pl: 'Kwas laurynowy (12:0)',
		name_en: 'Lauric acid (12:0)',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_14D0_g: {
		code: 'SFA_14D0_g',
		name_pl: 'Kwas mirystynowy (14:0)',
		name_en: 'Myristic acid (14:0)',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_15D0_g: {
		code: 'SFA_15D0_g',
		name_pl: 'SFA 15:0',
		name_en: 'Pentadecanoic acid',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_16D0_g: {
		code: 'SFA_16D0_g',
		name_pl: 'Kwas palmitynowy (16:0)',
		name_en: 'Palmitic acid (16:0)',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_17D0_g: {
		code: 'SFA_17D0_g',
		name_pl: 'SFA 17:0',
		name_en: 'Margaric acid (17:0)',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_18D0_g: {
		code: 'SFA_18D0_g',
		name_pl: 'Kwas stearynowy (18:0)',
		name_en: 'Stearic acid (18:0)',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_20D0_g: {
		code: 'SFA_20D0_g',
		name_pl: 'Kwas arachidowy (20:0)',
		name_en: 'Arachidic acid (20:0)',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_21D0_g: {
		code: 'SFA_21D0_g',
		name_pl: 'SFA 21:0',
		name_en: 'SFA 21:0',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_22D0_g: {
		code: 'SFA_22D0_g',
		name_pl: 'Kwas behenowy (22:0)',
		name_en: 'Behenic acid (22:0)',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_23D0_g: {
		code: 'SFA_23D0_g',
		name_pl: 'SFA 23:0',
		name_en: 'SFA 23:0',
		unit: 'g',
		category: 'fatty_acid'
	},
	SFA_24D0_g: {
		code: 'SFA_24D0_g',
		name_pl: 'Kwas lignocerowy (24:0)',
		name_en: 'Lignoceric acid (24:0)',
		unit: 'g',
		category: 'fatty_acid'
	},

	// MUFA (g)
	MUFA_12D1_g: {
		code: 'MUFA_12D1_g',
		name_pl: 'MUFA 12:1',
		name_en: 'MUFA 12:1',
		unit: 'g',
		category: 'fatty_acid'
	},
	MUFA_14D1_g: {
		code: 'MUFA_14D1_g',
		name_pl: 'MUFA 14:1',
		name_en: 'MUFA 14:1',
		unit: 'g',
		category: 'fatty_acid'
	},
	MUFA_15D1_g: {
		code: 'MUFA_15D1_g',
		name_pl: 'MUFA 15:1',
		name_en: 'MUFA 15:1',
		unit: 'g',
		category: 'fatty_acid'
	},
	MUFA_16D1C_g: {
		code: 'MUFA_16D1C_g',
		name_pl: 'Kwas palmitooleinowy',
		name_en: 'Palmitoleic acid (16:1c)',
		unit: 'g',
		category: 'fatty_acid'
	},
	MUFA_17D1_g: {
		code: 'MUFA_17D1_g',
		name_pl: 'MUFA 17:1',
		name_en: 'MUFA 17:1',
		unit: 'g',
		category: 'fatty_acid'
	},
	MUFA_18D1C_g: {
		code: 'MUFA_18D1C_g',
		name_pl: 'Kwas oleinowy',
		name_en: 'Oleic acid (18:1c)',
		unit: 'g',
		category: 'fatty_acid'
	},
	MUFA_18D1_g: {
		code: 'MUFA_18D1_g',
		name_pl: 'MUFA 18:1 (ogółem)',
		name_en: 'MUFA 18:1 (total)',
		unit: 'g',
		category: 'fatty_acid'
	},
	MUFA_20D1_g: {
		code: 'MUFA_20D1_g',
		name_pl: 'MUFA 20:1',
		name_en: 'MUFA 20:1',
		unit: 'g',
		category: 'fatty_acid'
	},
	MUFA_20D1C_g: {
		code: 'MUFA_20D1C_g',
		name_pl: 'MUFA 20:1 c',
		name_en: 'MUFA 20:1 c',
		unit: 'g',
		category: 'fatty_acid'
	},
	MUFA_22D1N9_g: {
		code: 'MUFA_22D1N9_g',
		name_pl: 'MUFA 22:1 n-9',
		name_en: 'MUFA 22:1 n-9',
		unit: 'g',
		category: 'fatty_acid'
	},
	MUFA_22D1N11_g: {
		code: 'MUFA_22D1N11_g',
		name_pl: 'MUFA 22:1 n-11',
		name_en: 'MUFA 22:1 n-11',
		unit: 'g',
		category: 'fatty_acid'
	},
	MUFA_22D1_g: {
		code: 'MUFA_22D1_g',
		name_pl: 'MUFA 22:1 (ogółem)',
		name_en: 'MUFA 22:1 (total)',
		unit: 'g',
		category: 'fatty_acid'
	},
	MUFA_24D1_g: {
		code: 'MUFA_24D1_g',
		name_pl: 'MUFA 24:1',
		name_en: 'MUFA 24:1',
		unit: 'g',
		category: 'fatty_acid'
	},

	// PUFA (g)
	PUFA_18D2_g: {
		code: 'PUFA_18D2_g',
		name_pl: 'PUFA 18:2 (ogółem)',
		name_en: 'PUFA 18:2 (total)',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_18D2CN6_g: {
		code: 'PUFA_18D2CN6_g',
		name_pl: 'Kwas linolowy (18:2 n-6)',
		name_en: 'Linoleic acid (18:2 n-6)',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_18D3_g: {
		code: 'PUFA_18D3_g',
		name_pl: 'PUFA 18:3 (ogółem)',
		name_en: 'PUFA 18:3 (total)',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_18D3CN3_g: {
		code: 'PUFA_18D3CN3_g',
		name_pl: 'ALA (18:3 n-3)',
		name_en: 'Alpha-linolenic acid',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_18D3CN6_g: {
		code: 'PUFA_18D3CN6_g',
		name_pl: 'Gamma-linolenowy (18:3 n-6)',
		name_en: 'Gamma-linolenic acid',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_18D4N3_g: {
		code: 'PUFA_18D4N3_g',
		name_pl: 'PUFA 18:4 n-3',
		name_en: 'PUFA 18:4 n-3',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_20D2CN6_g: {
		code: 'PUFA_20D2CN6_g',
		name_pl: 'PUFA 20:2 n-6',
		name_en: 'PUFA 20:2 n-6',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_20D2_g: {
		code: 'PUFA_20D2_g',
		name_pl: 'PUFA 20:2',
		name_en: 'PUFA 20:2',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_20D3N6_g: {
		code: 'PUFA_20D3N6_g',
		name_pl: 'PUFA 20:3 n-6',
		name_en: 'PUFA 20:3 n-6',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_20D3N3_g: {
		code: 'PUFA_20D3N3_g',
		name_pl: 'PUFA 20:3 n-3',
		name_en: 'PUFA 20:3 n-3',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_20D3N9_g: {
		code: 'PUFA_20D3N9_g',
		name_pl: 'PUFA 20:3 n-9',
		name_en: 'PUFA 20:3 n-9',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_20D3_g: {
		code: 'PUFA_20D3_g',
		name_pl: 'PUFA 20:3 (ogółem)',
		name_en: 'PUFA 20:3 (total)',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_20D4N6_g: {
		code: 'PUFA_20D4N6_g',
		name_pl: 'Kwas arachidonowy (20:4)',
		name_en: 'Arachidonic acid (20:4)',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_20D5CN3_g: {
		code: 'PUFA_20D5CN3_g',
		name_pl: 'EPA (20:5 n-3)',
		name_en: 'EPA (20:5 n-3)',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_22D2_g: {
		code: 'PUFA_22D2_g',
		name_pl: 'PUFA 22:2',
		name_en: 'PUFA 22:2',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_22D4_g: {
		code: 'PUFA_22D4_g',
		name_pl: 'PUFA 22:4',
		name_en: 'PUFA 22:4',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_22D5N3_g: {
		code: 'PUFA_22D5N3_g',
		name_pl: 'DPA (22:5 n-3)',
		name_en: 'DPA (22:5 n-3)',
		unit: 'g',
		category: 'fatty_acid'
	},
	PUFA_22D6CN3_g: {
		code: 'PUFA_22D6CN3_g',
		name_pl: 'DHA (22:6 n-3)',
		name_en: 'DHA (22:6 n-3)',
		unit: 'g',
		category: 'fatty_acid'
	},

	// Trans fatty acids (g)
	TFA_14D1T_g: {
		code: 'TFA_14D1T_g',
		name_pl: 'TFA 14:1 t',
		name_en: '14:1 trans',
		unit: 'g',
		category: 'fatty_acid'
	},
	TFA_16D1T_g: {
		code: 'TFA_16D1T_g',
		name_pl: 'TFA 16:1 t',
		name_en: '16:1 trans',
		unit: 'g',
		category: 'fatty_acid'
	},
	TFA_18D1T_g: {
		code: 'TFA_18D1T_g',
		name_pl: 'TFA 18:1 t',
		name_en: '18:1 trans',
		unit: 'g',
		category: 'fatty_acid'
	},
	TFA_18D2T_g: {
		code: 'TFA_18D2T_g',
		name_pl: 'TFA 18:2 t',
		name_en: '18:2 trans',
		unit: 'g',
		category: 'fatty_acid'
	},
	TFA_18D3TN3_g: {
		code: 'TFA_18D3TN3_g',
		name_pl: 'TFA 18:3 t n-3',
		name_en: '18:3 trans n-3',
		unit: 'g',
		category: 'fatty_acid'
	},
	TFA_20D1T_g: {
		code: 'TFA_20D1T_g',
		name_pl: 'TFA 20:1 t',
		name_en: '20:1 trans',
		unit: 'g',
		category: 'fatty_acid'
	},
	TFA_22D1T_g: {
		code: 'TFA_22D1T_g',
		name_pl: 'TFA 22:1 t',
		name_en: '22:1 trans',
		unit: 'g',
		category: 'fatty_acid'
	},
	TFA_18D2C9T11_g: {
		code: 'TFA_18D2C9T11_g',
		name_pl: 'CLA (c9,t11)',
		name_en: 'CLA (cis-9,trans-11)',
		unit: 'g',
		category: 'fatty_acid'
	},

	// Sterols (mg)[web:31]
	CHOLE_mg: {
		code: 'CHOLE_mg',
		name_pl: 'Cholesterol',
		name_en: 'Cholesterol',
		unit: 'mg',
		category: 'bioactives:lipids:sterols:cholesterol'
	},
	STERT_mg: {
		code: 'STERT_mg',
		name_pl: 'Ergosterol',
		name_en: 'Ergosterol',
		unit: 'mg',
		category: 'bioactives:lipids:sterols:total'
	},
	STGSTR_mg: {
		code: 'STGSTR_mg',
		name_pl: 'Stigmasterol',
		name_en: 'Stigmasterol',
		unit: 'mg',
		category: 'bioactives:lipids:sterols:plant_sterols'
	},
	CAMT_mg: {
		code: 'CAMT_mg',
		name_pl: 'Kampestanol',
		name_en: 'Campesterol',
		unit: 'mg',
		category: 'sterol'
	},
	BRASTR_mg: {
		code: 'BRASTR_mg',
		name_pl: 'Brassikasterol',
		name_en: 'Brassicasterol',
		unit: 'mg',
		category: 'sterol'
	},
	SITSTR_mg: {
		code: 'SITSTR_mg',
		name_pl: 'Beta-sitosterol',
		name_en: 'Beta-sitosterol',
		unit: 'mg',
		category: 'bioactives:lipids:sterols:plant_sterols'
	},

	// Fiber fractions (g)
	FIBSOL_g: {
		code: 'FIBSOL_g',
		name_pl: 'Błonnik rozpuszczalny',
		name_en: 'Soluble fibre',
		unit: 'g',
		category: 'fiber'
	},
	FIBINS_g: {
		code: 'FIBINS_g',
		name_pl: 'Błonnik nierozpuszczalny',
		name_en: 'Insoluble fibre',
		unit: 'g',
		category: 'fiber'
	},

	// Organic acids (mg)
	CITAC_mg: {
		code: 'CITAC_mg',
		name_pl: 'Kwas cytrynowy',
		name_en: 'Citric acid',
		unit: 'mg',
		category: 'organic_acid'
	},
	MALAC_mg: {
		code: 'MALAC_mg',
		name_pl: 'Kwas jabłkowy',
		name_en: 'Malic acid',
		unit: 'mg',
		category: 'organic_acid'
	},
	OXALAC_mg: {
		code: 'OXALAC_mg',
		name_pl: 'Kwas szczawiowy',
		name_en: 'Oxalic acid',
		unit: 'mg',
		category: 'organic_acid'
	},
	QUINAC_mg: {
		code: 'QUINAC_mg',
		name_pl: 'Kwas chinowy',
		name_en: 'Quinic acid',
		unit: 'mg',
		category: 'organic_acid'
	},

	// Other
	CHOLN_mg: {
		code: 'CHOLN_mg',
		name_pl: 'Cholina ogółem',
		name_en: 'Choline, total',
		unit: 'mg',
		category: 'other'
	},
	BETN_mg: {
		code: 'BETN_mg',
		name_pl: 'Betaina',
		name_en: 'Betaine',
		unit: 'mg',
		category: 'other'
	}
} as const;

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
