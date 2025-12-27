#!/usr/bin/env python3
"""
Migration script to add Polish translations (name_pl) to nutrition table.
Assumes nutrition.id already uses INFOODS codes.
"""

import os
import sys
from pathlib import Path

# Add parent directory to path to import database utilities
sys.path.append(str(Path(__file__).parent.parent / "typesense"))
from utils import get_db_connection

# English to Polish nutrient name mapping
NUTRIENT_NAME_PL_MAPPING = {
    # Energy
    "Energy": "Energia",
    "Energy (Atwater General Factors)": "Energia (współczynniki Atwatera ogólne)",
    "Energy (Atwater Specific Factors)": "Energia (współczynniki Atwatera specyficzne)",

    # Macronutrients
    "Protein": "Białko",
    "Total lipid (fat)": "Tłuszcze ogółem",
    "Total fat (NLEA)": "Tłuszcze ogółem (NLEA)",
    "Carbohydrate, by difference": "Węglowodany (przez różnicę)",
    "Carbohydrate, by summation": "Węglowodany (przez sumowanie)",
    "Fiber, total dietary": "Błonnik pokarmowy ogółem",
    "Fiber, soluble": "Błonnik rozpuszczalny",
    "Fiber, insoluble": "Błonnik nierozpuszczalny",
    "Total dietary fiber (AOAC 2011.25)": "Błonnik pokarmowy ogółem (AOAC 2011.25)",
    "Sugars, Total": "Cukry ogółem",
    "Total Sugars": "Cukry całkowite",
    "Ash": "Popiół",
    "Water": "Woda",
    "Nitrogen": "Azot",

    # Minerals
    "Calcium, Ca": "Wapń",
    "Iron, Fe": "Żelazo",
    "Magnesium, Mg": "Magnez",
    "Phosphorus, P": "Fosfor",
    "Potassium, K": "Potas",
    "Sodium, Na": "Sód",
    "Zinc, Zn": "Cynk",
    "Copper, Cu": "Miedź",
    "Manganese, Mn": "Mangan",
    "Selenium, Se": "Selen",
    "Iodine, I": "Jod",
    "Molybdenum, Mo": "Molibden",
    "Boron, B": "Bor",
    "Cobalt, Co": "Kobalt",
    "Nickel, Ni": "Nikiel",
    "Sulfur, S": "Siarka",

    # Vitamins - Fat Soluble
    "Vitamin A": "Witamina A",
    "Vitamin A, RAE": "Witamina A (RAE)",
    "Retinol": "Retinol",
    "Carotene, alpha": "Karoten alfa",
    "Carotene, beta": "Karoten beta",
    "Carotene, gamma": "Karoten gamma",
    "Cryptoxanthin, alpha": "Kryptoksantyna alfa",
    "Cryptoxanthin, beta": "Kryptoksantyna beta",
    "Lutein": "Luteina",
    "Lutein + zeaxanthin": "Luteina + zeaksantyna",
    "Lycopene": "Likopen",
    "Zeaxanthin": "Zeaksantyna",
    "cis-Lutein/Zeaxanthin": "cis-Luteina/Zeaksantyna",
    "cis-Lycopene": "cis-Likopen",
    "trans-Lycopene": "trans-Likopen",
    "cis-beta-Carotene": "cis-beta-Karoten",
    "trans-beta-Carotene": "trans-beta-Karoten",
    "Phytoene": "Fitoene",
    "Phytofluene": "Fitofluene",

    # Vitamin D
    "Vitamin D (D2 + D3)": "Witamina D (D2 + D3)",
    "Vitamin D (D2 + D3), International Units": "Witamina D (D2 + D3), jednostki międzynarodowe",
    "Vitamin D2 (ergocalciferol)": "Witamina D2 (ergokalcyferol)",
    "Vitamin D3 (cholecalciferol)": "Witamina D3 (cholekalcyferol)",
    "Vitamin D4": "Witamina D4",
    "25-hydroxycholecalciferol": "25-hydroksycholekalcyferol",

    # Vitamin E
    "Vitamin E (alpha-tocopherol)": "Witamina E (alfa-tokoferol)",
    "Tocopherol, beta": "Tokoferol beta",
    "Tocopherol, gamma": "Tokoferol gamma",
    "Tocopherol, delta": "Tokoferol delta",
    "Tocotrienol, alpha": "Tokotrienol alfa",
    "Tocotrienol, beta": "Tokotrienol beta",
    "Tocotrienol, gamma": "Tokotrienol gamma",
    "Tocotrienol, delta": "Tokotrienol delta",

    # Vitamin K
    "Vitamin K (phylloquinone)": "Witamina K (filochinon)",
    "Vitamin K (Menaquinone-4)": "Witamina K (menachinon-4)",
    "Vitamin K (Dihydrophylloquinone)": "Witamina K (dihydrofilochinon)",

    # Vitamins - Water Soluble
    "Vitamin C, total ascorbic acid": "Witamina C, kwas askorbinowy ogółem",
    "Thiamin": "Tiamina (witamina B1)",
    "Riboflavin": "Ryboflawina (witamina B2)",
    "Niacin": "Niacyna (witamina B3)",
    "Pantothenic acid": "Kwas pantotenowy (witamina B5)",
    "Vitamin B-6": "Witamina B6",
    "Biotin": "Biotyna (witamina B7)",
    "Folate, total": "Foliany ogółem",
    "10-Formyl folic acid (10HCOFA)": "Kwas 10-formylofolowy",
    "5-Formyltetrahydrofolic acid (5-HCOH4": "Kwas 5-formylotetrahydrofolowy",
    "5-methyl tetrahydrofolate (5-MTHF)": "5-metylo-tetrahydrofolian",
    "Vitamin B-12": "Witamina B12",
    "Choline, total": "Cholina ogółem",
    "Choline, free": "Cholina wolna",
    "Choline, from glycerophosphocholine": "Cholina z glicerofosfocholiny",
    "Choline, from phosphocholine": "Cholina z fosfocholiny",
    "Choline, from phosphotidyl choline": "Cholina z fosfatydylocholiny",
    "Choline, from sphingomyelin": "Cholina ze sfingomieliny",
    "Betaine": "Betaina",

    # Amino Acids
    "Alanine": "Alanina",
    "Arginine": "Arginina",
    "Aspartic acid": "Kwas asparaginowy",
    "Cysteine": "Cysteina",
    "Cystine": "Cystyna",
    "Glutamic acid": "Kwas glutaminowy",
    "Glycine": "Glicyna",
    "Histidine": "Histydyna",
    "Hydroxyproline": "Hydroksyprolina",
    "Isoleucine": "Izoleucyna",
    "Leucine": "Leucyna",
    "Lysine": "Lizyna",
    "Methionine": "Metionina",
    "Phenylalanine": "Fenyloalanina",
    "Proline": "Prolina",
    "Serine": "Seryna",
    "Threonine": "Treonina",
    "Tryptophan": "Tryptofan",
    "Tyrosine": "Tyrozyna",
    "Valine": "Walina",

    # Fatty Acids - Summary
    "Fatty acids, total saturated": "Kwasy tłuszczowe nasycone ogółem",
    "Fatty acids, total monounsaturated": "Kwasy tłuszczowe jednonienasycone ogółem",
    "Fatty acids, total polyunsaturated": "Kwasy tłuszczowe wielonienasycone ogółem",
    "Fatty acids, total trans": "Kwasy tłuszczowe trans ogółem",
    "Fatty acids, total trans-monoenoic": "Kwasy tłuszczowe trans-jednonienasycone",
    "Fatty acids, total trans-dienoic": "Kwasy tłuszczowe trans-dwunienasycone",
    "Fatty acids, total trans-polyenoic": "Kwasy tłuszczowe trans-wielonienasycone",

    # Saturated Fatty Acids (SFA)
    "SFA 4:0": "Kwas masłowy (4:0)",
    "SFA 5:0": "Kwas walerianowy (5:0)",
    "SFA 6:0": "Kwas kapronowy (6:0)",
    "SFA 7:0": "Kwas enantowy (7:0)",
    "SFA 8:0": "Kwas kaprylowy (8:0)",
    "SFA 9:0": "Kwas pelargonowy (9:0)",
    "SFA 10:0": "Kwas kaprynowy (10:0)",
    "SFA 11:0": "Kwas undecylowy (11:0)",
    "SFA 12:0": "Kwas laurynowy (12:0)",
    "SFA 14:0": "Kwas mirystynowy (14:0)",
    "SFA 15:0": "Kwas pentadekanowy (15:0)",
    "SFA 16:0": "Kwas palmitynowy (16:0)",
    "SFA 17:0": "Kwas margarynowy (17:0)",
    "SFA 18:0": "Kwas stearynowy (18:0)",
    "SFA 20:0": "Kwas arachidowy (20:0)",
    "SFA 21:0": "Kwas heneikozanowy (21:0)",
    "SFA 22:0": "Kwas behenowy (22:0)",
    "SFA 23:0": "Kwas trykozanowy (23:0)",
    "SFA 24:0": "Kwas lignocerynowy (24:0)",

    # Monounsaturated Fatty Acids (MUFA)
    "MUFA 12:1": "Kwas dodekenowy (12:1)",
    "MUFA 14:1 c": "Kwas mirystoleinowy cis (14:1)",
    "MUFA 15:1": "Kwas pentadekenowy (15:1)",
    "MUFA 16:1 c": "Kwas palmitoleinowy cis (16:1)",
    "MUFA 17:1": "Kwas heptadekenowy (17:1)",
    "MUFA 17:1 c": "Kwas heptadekenowy cis (17:1)",
    "MUFA 18:1": "Kwas oleinowy (18:1)",
    "MUFA 18:1 c": "Kwas oleinowy cis (18:1)",
    "MUFA 20:1": "Kwas eikozoenowy (20:1)",
    "MUFA 20:1 c": "Kwas eikozoenowy cis (20:1)",
    "MUFA 22:1": "Kwas erukolowy (22:1)",
    "MUFA 22:1 c": "Kwas erukolowy cis (22:1)",
    "MUFA 22:1 n-9": "Kwas erukolowy n-9 (22:1)",
    "MUFA 22:1 n-11": "Kwas cetoleinowy n-11 (22:1)",
    "MUFA 24:1 c": "Kwas nerwonowy cis (24:1)",

    # Polyunsaturated Fatty Acids (PUFA)
    "PUFA 18:2": "Kwas linolowy (18:2)",
    "PUFA 18:2 c": "Kwas linolowy cis (18:2)",
    "PUFA 18:2 n-6 c,c": "Kwas linolowy n-6 (18:2)",
    "PUFA 18:2 CLAs": "Sprzężony kwas linolowy (CLA)",
    "PUFA 18:3": "Kwas linolenowy (18:3)",
    "PUFA 18:3 c": "Kwas linolenowy cis (18:3)",
    "PUFA 18:3 n-3 c,c,c (ALA)": "Kwas alfa-linolenowy (ALA)",
    "PUFA 18:3 n-6 c,c,c": "Kwas gamma-linolenowy (GLA)",
    "PUFA 18:3i": "Kwas linolenowy izomer",
    "PUFA 18:4": "Kwas stearydonowy (18:4)",
    "PUFA 20:2 c": "Kwas eikozadienowy cis (20:2)",
    "PUFA 20:2 n-6 c,c": "Kwas eikozadienowy n-6 (20:2)",
    "PUFA 20:3": "Kwas eikozatrienowy (20:3)",
    "PUFA 20:3 c": "Kwas eikozatrienowy cis (20:3)",
    "PUFA 20:3 n-3": "Kwas eikozatrienowy n-3 (20:3)",
    "PUFA 20:3 n-6": "Kwas dihomo-gamma-linolenowy (DGLA)",
    "PUFA 20:3 n-9": "Kwas eikozatrienowy n-9 (20:3)",
    "PUFA 20:4": "Kwas arachidonowy (20:4)",
    "PUFA 20:4c": "Kwas arachidonowy cis (20:4)",
    "PUFA 20:5 n-3 (EPA)": "Kwas eikozapentaenowy (EPA)",
    "PUFA 20:5c": "Kwas eikozapentaenowy cis (20:5)",
    "PUFA 22:2": "Kwas dokozadienowy (22:2)",
    "PUFA 22:3": "Kwas dokozatrienowy (22:3)",
    "PUFA 22:4": "Kwas dokozatetraenowy (22:4)",
    "PUFA 22:5 c": "Kwas dokozapentaenowy cis (22:5)",
    "PUFA 22:5 n-3 (DPA)": "Kwas dokozapentaenowy (DPA)",
    "PUFA 22:6 c": "Kwas dokozaheksaenowy cis (22:6)",
    "PUFA 22:6 n-3 (DHA)": "Kwas dokozaheksaenowy (DHA)",

    # Trans Fatty Acids (TFA)
    "TFA 14:1 t": "Kwas mirystoleinowy trans (14:1)",
    "TFA 16:1 t": "Kwas palmitoleinowy trans (16:1)",
    "TFA 18:1 t": "Kwas elaidynowy (18:1 trans)",
    "TFA 18:2 t": "Kwas linolowy trans (18:2)",
    "TFA 18:2 t not further defined": "Kwas linolowy trans (nieokreślony)",
    "TFA 18:3 t": "Kwas linolenowy trans (18:3)",
    "TFA 20:1 t": "Kwas eikozoenowy trans (20:1)",
    "TFA 22:1 t": "Kwas erukolowy trans (22:1)",

    # Sterols
    "Cholesterol": "Cholesterol",
    "Phytosterols, other": "Fitosterole, inne",
    "Beta-sitosterol": "Beta-sitosterol",
    "Beta-sitostanol": "Beta-sitostanol",
    "Campesterol": "Kampesterol",
    "Campestanol": "Kampestanol",
    "Stigmasterol": "Stigmasterol",
    "Stigmastadiene": "Stigmastadien",
    "Brassicasterol": "Brassikasterol",
    "Delta-5-avenasterol": "Delta-5-awenasterol",
    "Delta-7-Stigmastenol": "Delta-7-stigmastenol",
    "Ergosterol": "Ergosterol",
    "Ergosta-5,7-dienol": "Ergosta-5,7-dienol",
    "Ergosta-7,22-dienol": "Ergosta-7,22-dienol",
    "Ergosta-7-enol": "Ergosta-7-enol",

    # Sugars
    "Fructose": "Fruktoza",
    "Galactose": "Galaktoza",
    "Glucose": "Glukoza",
    "Lactose": "Laktoza",
    "Maltose": "Maltoza",
    "Sucrose": "Sacharoza",
    "Raffinose": "Rafinoza",
    "Stachyose": "Stachioza",
    "Verbascose": "Werbaskoza",
    "Starch": "Skrobia",
    "Resistant starch": "Skrobia odporna",
    "Beta-glucan": "Beta-glukan",

    # Organic Acids
    "Citric acid": "Kwas cytrynowy",
    "Malic acid": "Kwas jabłkowy",
    "Oxalic acid": "Kwas szczawiowy",
    "Pyruvic acid": "Kwas pirogronowy",
    "Quinic acid": "Kwas chinowy",

    # Isoflavones
    "Daidzein": "Daidzeina",
    "Daidzin": "Daidzyna",
    "Genistein": "Genisteina",
    "Genistin": "Genistyna",
    "Glycitin": "Glicytyna",

    # Other
    "Glutathione": "Glutation",
    "Ergothioneine": "Ergotioneina",
    "Specific Gravity": "Gęstość właściwa",
    "High Molecular Weight Dietary Fiber (HMWDF)": "Błonnik o wysokiej masie cząsteczkowej",
    "Low Molecular Weight Dietary Fiber (LMWDF)": "Błonnik o niskiej masie cząsteczkowej",
}


def generate_polish_names_mapping(conn):
    """
    Generate mapping for all nutrients in the database.
    Returns list of (id/code, name_en, name_pl_translation)
    """
    cursor = conn.cursor()
    cursor.execute("SELECT id, name_en FROM nutrition ORDER BY name_en")
    rows = cursor.fetchall()
    cursor.close()

    mappings = []
    unmapped_nutrients = []

    for code, name_en in rows:
        if name_en in NUTRIENT_NAME_PL_MAPPING:
            name_pl = NUTRIENT_NAME_PL_MAPPING[name_en]
            mappings.append((code, name_en, name_pl))
        else:
            unmapped_nutrients.append((code, name_en))

    return mappings, unmapped_nutrients


def generate_migration_sql(mappings):
    """Generate SQL migration script for Polish names."""

    sql = """/*
  Migration: Add Polish translations (name_pl) to nutrition table

  This migration updates the name_pl column for all nutrients
  based on professional Polish translations.
*/

-- Update Polish names for all nutrients
"""

    # Add UPDATE statements for each nutrient
    for code, name_en, name_pl in mappings:
        # Escape single quotes in Polish names
        name_pl_escaped = name_pl.replace("'", "''")
        sql += f"UPDATE \"nutrition\" SET name_pl = '{name_pl_escaped}' WHERE id = '{code}';\n"

    sql += """
-- Verify all updates
DO $$
DECLARE
    total_count INTEGER;
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM nutrition;
    SELECT COUNT(*) INTO updated_count FROM nutrition WHERE name_pl IS NOT NULL;

    RAISE NOTICE 'Total nutrients: %', total_count;
    RAISE NOTICE 'Nutrients with Polish names: %', updated_count;
    RAISE NOTICE 'Missing Polish translations: %', total_count - updated_count;
END $$;
"""

    return sql


def main():
    print("=" * 70)
    print("Add Polish Translations to Nutrition Table")
    print("=" * 70)

    # Connect to database
    conn = get_db_connection()

    try:
        # Generate Polish name mapping
        print("\n[*] Generating Polish name mappings...")
        mappings, unmapped = generate_polish_names_mapping(conn)

        mapped_count = len(mappings)
        unmapped_count = len(unmapped)

        print(f"  [OK] Mapped: {mapped_count} nutrients")
        print(f"  [!] Missing translations: {unmapped_count} nutrients")

        if unmapped:
            print(f"\n[!] Nutrients missing Polish translations:")
            for code, name_en in sorted(unmapped, key=lambda x: x[1]):
                print(f"     [{code}] {name_en}")

        # Generate migration SQL
        print(f"\n[*] Generating migration SQL...")
        migration_sql = generate_migration_sql(mappings)

        # Write to file
        output_dir = Path(__file__).parent.parent.parent / "packages" / "db" / "prisma" / "migrations"
        output_file = output_dir / f"add_nutrition_polish_names.sql"

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(migration_sql)

        print(f"  [OK] Migration SQL written to: {output_file}")

        print(f"\n{'=' * 70}")
        print(f"[OK] Migration script generated successfully!")
        print(f"{'=' * 70}")
        print(f"\nNext steps:")
        print(f"1. Review unmapped nutrients above (if any)")
        print(f"2. Optionally add missing translations to NUTRIENT_NAME_PL_MAPPING")
        print(f"3. Apply migration:")
        print(f"   cat {output_file.name} | docker exec -i lifeos-postgres psql -U lifeos -d lifeos")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
