/**
 * Mapping from FDC nutrient IDs to database nutrient IDs
 *
 * FDC (FoodData Central) uses numeric IDs for nutrients.
 * We map these to our database INFOODS-based IDs with unit suffixes.
 *
 * Database ID format: {INFOODS_CODE}_{unit}
 * Examples: VITC_mg, CA_mg, PROTCNT_g, ENERC_kcal
 *
 * Source: USDA FoodData Central API documentation
 * https://fdc.nal.usda.gov/api-guide.html
 */

export const FDC_TO_INFOODS: Record<number, string> = {
	// Energy
	1008: 'ENERA_kcal', // Energy (kcal)
	1062: 'ENERA_kJ', // Energy (kJ)
	2047: 'ENERC_AGF_kcal', // Energy (Atwater General Factors)
	2048: 'ENERC_ASF_kcal', // Energy (Atwater Specific Factors)

	// Macronutrients (g)
	1002: 'NT_g', // Nitrogen, total
	1003: 'PROTCNT_g', // Protein, total; calculated from total nitrogen
	1004: 'FAT_g', // Total lipid (fat)
	1005: 'CHOCDF_g', // Carbohydrate, by difference
	1050: 'CHOAVL_g', // Carbohydrate, by summation
	1079: 'FIBTG_g', // Fiber, total dietary
	2033: 'FIBTGLCS_g', // Total dietary fiber (AOAC 2011.25)
	1051: 'WATER_g', // Water
	1007: 'ASH_g', // Ash
	1009: 'STARCH_g', // Starch
	1071: 'STARES_g', // Resistant starch

	// Sugars (g)
	1063: 'SUGAR_g', // Sugars, Total
	1072: 'SUGAR_g', // Sugars, Total (duplicate mapping)
	2000: 'SUGAR_g', // Sugars, Total (duplicate mapping)
	1010: 'SUCS_g', // Sucrose
	1011: 'GLUS_g', // Glucose
	1012: 'FRUS_g', // Fructose
	1013: 'LACS_g', // Lactose
	1014: 'MALS_g', // Maltose
	1075: 'GALS_g', // Galactose

	// Minerals (mg)
	1087: 'CA_mg', // Calcium, Ca
	1089: 'FE_mg', // Iron, Fe
	1090: 'MG_mg', // Magnesium, Mg
	1091: 'P_mg', // Phosphorus, P
	1092: 'K_mg', // Potassium, K
	1093: 'NA_mg', // Sodium, Na
	1095: 'ZN_mg', // Zinc, Zn
	1098: 'CU_mg', // Copper, Cu
	1100: 'ID_mcg', // Iodine, I
	1101: 'MN_mg', // Manganese, Mn
	1102: 'MO_mcg', // Molybdenum, Mo
	1103: 'SE_mcg', // Selenium, Se
	1094: 'S_mg', // Sulfur, S
	1097: 'CO_mcg', // Cobalt, Co
	1137: 'B_mcg', // Boron, B
	1146: 'NI_mcg', // Nickel, Ni

	// Vitamins
	1106: 'VITA_RAE_mcg', // Vitamin A, RAE (mcg)
	1105: 'RETOL_mcg', // Retinol (mcg)
	1107: 'CARTB_mcg', // Carotene, beta (mcg)
	1108: 'CARTA_mcg', // Carotene, alpha (mcg)
	1120: 'CRYPXB_mcg', // Cryptoxanthin, beta
	1121: 'LUTN_mcg', // Lutein
	1119: 'ZEA_mcg', // Zeaxanthin
	1122: 'LYCPN_mcg', // Lycopene
	1123: 'LUTNZEA_mcg', // Lutein + zeaxanthin
	1162: 'VITC_mg', // Vitamin C, total ascorbic acid
	1110: 'VITD_IU', // Vitamin D (D2 + D3)
	1111: 'ERGCAL_mcg', // Vitamin D (D2 + D3)
	1112: 'CHOCALOH_mcg', // Vitamin D (D2 + D3)
	1114: 'VITD_mcg', // Vitamin D (D2 + D3)
	1109: 'TOCPHA_mg', // Vitamin E (alpha-tocopherol)
	1125: 'TOCPHB_mg', // Tocopherol, beta
	1126: 'TOCPHG_mg', // Tocopherol, gamma
	1127: 'TOCPHD_mg', // Tocopherol, delta
	1128: 'TOCTRA_mg', // Tocotrienol, alpha
	1129: 'TOCTRB_mg', // Tocotrienol, beta
	1130: 'TOCTRG_mg', // Tocotrienol, gamma
	1131: 'TOCTRD_mg', // Tocotrienol, delta
	1185: 'VITK1_mcg', // Vitamin K (phylloquinone)
	1184: 'VITK2_mcg', // Vitamin K (Dihydrophylloquinone)
	1183: 'VITK3_mcg', // Vitamin K (Menaquinone-4)
	1165: 'THIA_mg', // Thiamin
	1166: 'RIBF_mg', // Riboflavin
	1167: 'NIA_mg', // Niacin
	1170: 'PANTAC_mg', // Pantothenic acid
	1175: 'VITB6A_mg', // Vitamin B-6 (total, determined by analysis)
	1176: 'BIOT_mcg', // Biotin
	1177: 'FOL_mcg', // Folate, total
	1178: 'VITB12_mcg', // Vitamin B-12

	// Amino Acids (mg)
	1221: 'ALA_mg', // Alanine
	1220: 'ARG_mg', // Arginine
	1222: 'ASP_mg', // Aspartic acid
	1216: 'CYS_mg', // Cystine
	1232: 'CYSTE_mg', // Cysteine
	1223: 'GLU_mg', // Glutamic acid
	1224: 'GLY_mg', // Glycine
	1228: 'HYP_mg', // Hydroxyproline
	1212: 'HIS_mg', // Histidine
	1213: 'ILE_mg', // Isoleucine
	1214: 'LEU_mg', // Leucine
	1215: 'LYS_mg', // Lysine
	1217: 'MET_mg', // Methionine
	1218: 'PHE_mg', // Phenylalanine
	1225: 'PRO_mg', // Proline
	1226: 'SER_mg', // Serine
	1211: 'THR_mg', // Threonine
	1210: 'TRP_mg', // Tryptophan
	1219: 'TYR_mg', // Tyrosine
	1227: 'VAL_mg', // Valine

	// Fatty Acids - Totals (g)
	1258: 'FASAT_g', // Fatty acids, total saturated
	1292: 'FAMS_g', // Fatty acids, total monounsaturated
	1293: 'FAPU_g', // Fatty acids, total polyunsaturated
	1257: 'FATRN_g', // Fatty acids, total trans
	// 1329: Fatty acids, total trans-monoenoic - not in database

	// Saturated Fatty Acids (SFA) (g)
	1259: 'SFA_4D0_g', // SFA 4:0 (Butyric)
	1260: 'SFA_6D0_g', // SFA 6:0 (Caproic)
	1261: 'SFA_8D0_g', // SFA 8:0 (Caprylic)
	1262: 'SFA_10D0_g', // SFA 10:0 (Capric)
	1335: 'SFA_11D0_g', // SFA 11:0
	1263: 'SFA_12D0_g', // SFA 12:0 (Lauric)
	1264: 'SFA_14D0_g', // SFA 14:0 (Myristic)
	1299: 'SFA_15D0_g', // SFA 15:0 (Pentadecanoic)
	1265: 'SFA_16D0_g', // SFA 16:0 (Palmitic)
	1300: 'SFA_17D0_g', // SFA 17:0 (Margaric)
	1266: 'SFA_18D0_g', // SFA 18:0 (Stearic)
	1267: 'SFA_20D0_g', // SFA 20:0 (Arachidic)
	2006: 'SFA_21D0_g', // SFA 21:0
	1273: 'SFA_22D0_g', // SFA 22:0 (Behenic)
	2007: 'SFA_23D0_g', // SFA 23:0
	1301: 'SFA_24D0_g', // SFA 24:0 (Lignoceric)

	// Monounsaturated Fatty Acids (MUFA) (g)
	2008: 'MUFA_12D1_g', // MUFA 12:1
	2009: 'MUFA_14D1_g', // MUFA 14:1 c
	1333: 'MUFA_15D1_g', // MUFA 15:1
	1314: 'MUFA_16D1C_g', // MUFA 16:1 c (Palmitoleic)
	1323: 'MUFA_17D1_g', // MUFA 17:1
	1315: 'MUFA_18D1C_g', // MUFA 18:1 c (Oleic)
	1277: 'MUFA_20D1_g', // MUFA 20:1
	2012: 'MUFA_20D1C_g', // MUFA 20:1 c
	2014: 'MUFA_22D1N9_g', // MUFA 22:1 n-9
	2015: 'MUFA_22D1N11_g', // MUFA 22:1 n-11
	1312: 'MUFA_24D1_g', // MUFA 24:1 c

	// Polyunsaturated Fatty Acids (PUFA) (g)
	1316: 'PUFA_18D2CN6_g', // PUFA 18:2 n-6 c,c (Linoleic)
	1404: 'PUFA_18D3CN3_g', // PUFA 18:3 n-3 c,c,c (ALA - Alpha-linolenic)
	1321: 'PUFA_18D3CN6_g', // PUFA 18:3 n-6 c,c,c (Gamma-linolenic)
	1276: 'PUFA_18D4N3_g', // PUFA 18:4 n-3
	1313: 'PUFA_20D2CN6_g', // PUFA 20:2 n-6 c,c
	2026: 'PUFA_20D2_g', // PUFA 20:2 c
	1406: 'PUFA_20D3N6_g', // PUFA 20:3 n-6
	1405: 'PUFA_20D3N3_g', // PUFA 20:3 n-3
	1414: 'PUFA_20D3N9_g', // PUFA 20:3 n-9
	2020: 'PUFA_20D3_g', // PUFA 20:3 c
	1271: 'PUFA_20D4N6_g', // PUFA 20:4 n-6 (Arachidonic)
	1278: 'PUFA_20D5CN3_g', // PUFA 20:5 n-3 c (EPA)
	1334: 'PUFA_22D2_g', // PUFA 22:2
	1411: 'PUFA_22D4_g', // PUFA 22:4
	1280: 'PUFA_22D5N3_g', // PUFA 22:5 n-3 (DPA)
	1272: 'PUFA_22D6CN3_g', // PUFA 22:6 n-3 c (DHA)

	// Trans Fatty Acids (TFA) (g)
	1281: 'TFA_14D1T_g', // TFA 14:1 t
	1303: 'TFA_16D1T_g', // TFA 16:1 t
	1304: 'TFA_18D1T_g', // TFA 18:1 t
	// 1306: TFA 18:2 t - not in database
	2019: 'TFA_18D3TN3_g', // TFA 18:3 t
	2013: 'TFA_20D1T_g', // TFA 20:1 t
	1305: 'TFA_22D1T_g', // TFA 22:1 t

	// Conjugated Linoleic Acids (CLA) (g)
	1311: 'TFA_18D2C9T11_g', // PUFA 18:2 CLAs (cis-9,trans-11)

	// Additional Trans Fatty Acids (TFA) (g)
	1306: 'TFA_18D2T_g', // TFA 18:2 t

	// General Fatty Acid Forms (g)
	1268: 'MUFA_18D1_g', // MUFA 18:1 (general)
	1269: 'PUFA_18D2_g', // PUFA 18:2 (general)
	1270: 'PUFA_18D3_g', // PUFA 18:3 (general)
	1279: 'MUFA_22D1_g', // MUFA 22:1 (general)
	1325: 'PUFA_20D3_g', // PUFA 20:3 (general)
	// Sterols (mg)
	1253: 'CHOLE_mg', // Cholesterol
	1284: 'STERT_mg', // Ergosterol -> total sterols
	1285: 'STGSTR_mg', // Stigmasterol
	1286: 'CAMT_mg', // Campesterol
	1287: 'BRASTR_mg', // Brassicasterol
	1288: 'SITSTR_mg', // Beta-sitosterol

	// Fiber Fractions (g)
	1082: 'FIBSOL_g', // Fiber, soluble
	1084: 'FIBINS_g', // Fiber, insoluble

	// Vitamins & Carotenoids (mcg/mg)
	1113: 'CHOCAL_mcg', // 25-hydroxycholecalciferol
	1116: 'CARPT_mcg', // Phytoene -> total carotene
	1117: 'CARPTF_mcg', // Phytofluene -> total carotene
	1118: 'CARTG_mcg', // Carotene, gamma
	1159: 'CARTBCIS_mcg', // cis-beta-Carotene
	2032: 'CRYPXA_mcg', // Cryptoxanthin, alpha
	2066: 'VITA_mcg', // Vitamin A (general)

	// Folates (mcg)
	1188: 'FOLH4FM5_mcg', // 5-methyl tetrahydrofolate -> total folate
	1191: 'FOLFM10_mcg', // 10-Formyl folic acid
	1192: 'FOLH4ME5_mcg', // 5-Formyltetrahydrofolic acid -> total folate

	// Organic Acids (mg)
	1032: 'CITAC_mg', // Citric acid
	1039: 'MALAC_mg', // Malic acid
	1041: 'OXALAC_mg', // Oxalic acid
	// Note: 1043 (Pyruvic acid) not in database
	1044: 'QUINAC_mg', // Quinic acid

	// Sugars/Oligosaccharides (g)
	1076: 'RAFS_g', // Raffinose
	1077: 'STAS_g', // Stachyose
	2058: 'GLUCNB_g', // Beta-glucan
	2063: 'VERS_g', // Verbascose

	// Other
	1180: 'CHOLN_mg' // Choline, total
	// Note: Choline fractions (1194, 1195, 1196, 1197, 1199) not mapped - would duplicate total choline
	// Note: Not in database: 1198 (Betaine), 2057 (Ergothioneine), 2069 (Glutathione),
	//       1340 (Daidzein), 1341 (Genistein), 2049 (Daidzin), 2050 (Genistin), 2051 (Glycitin),
	//       1024 (Specific Gravity), 1329/1330/1331 (trans fatty acid totals)
};

/**
 * Get FDC nutrient ID from INFOODS code
 * Returns undefined if no mapping exists
 */
export function infoodsToFdcNutrient(infoodsCode: string): number | undefined {
	const entry = Object.entries(FDC_TO_INFOODS).find(([, code]) => code === infoodsCode);
	return entry ? Number(entry[0]) : undefined;
}
