#!/usr/bin/env python3
"""
Migration script to convert nutrition.id from UUID to INFOODS tagname codes.
This improves readability and enables integration with multiple data sources.

INFOODS tagnames: https://www.fao.org/infoods/infoods/standards-guidelines/en/
"""

import os
import sys
from pathlib import Path

# Add parent directory to path to import database utilities
sys.path.append(str(Path(__file__).parent.parent / "typesense"))
from utils import get_db_connection

# USDA FoodData to INFOODS tagname mapping
NUTRIENT_CODE_MAPPING = {
    # Energy
    "Energy": "ENERC_KCAL",  # kcal version
    "Energy (Atwater General Factors)": "ENERC_ATW",
    "Energy (Atwater Specific Factors)": "ENERC_ATWS",

    # Macronutrients
    "Protein": "PROT",
    "Total lipid (fat)": "FAT",
    "Total fat (NLEA)": "FATNLEA",
    "Carbohydrate, by difference": "CHOCDF",
    "Carbohydrate, by summation": "CHOCSM",
    "Fiber, total dietary": "FIBTG",
    "Fiber, soluble": "FIBSOL",
    "Fiber, insoluble": "FIBINS",
    "Total dietary fiber (AOAC 2011.25)": "FIBTG_AOAC",
    "Sugars, Total": "SUGAR",
    "Total Sugars": "SUGAR_TOT",
    "Ash": "ASH",
    "Water": "WATER",
    "Nitrogen": "NT",

    # Minerals
    "Calcium, Ca": "CA",
    "Iron, Fe": "FE",
    "Magnesium, Mg": "MG",
    "Phosphorus, P": "P",
    "Potassium, K": "K",
    "Sodium, Na": "NA",
    "Zinc, Zn": "ZN",
    "Copper, Cu": "CU",
    "Manganese, Mn": "MN",
    "Selenium, Se": "SE",
    "Iodine, I": "ID",
    "Molybdenum, Mo": "MO",
    "Boron, B": "B",
    "Cobalt, Co": "CO",
    "Nickel, Ni": "NI",
    "Sulfur, S": "S",

    # Vitamins - Fat Soluble
    "Vitamin A": "VITA",
    "Vitamin A, RAE": "VITA_RAE",
    "Retinol": "RETOL",
    "Carotene, alpha": "CARTA",
    "Carotene, beta": "CARTB",
    "Carotene, gamma": "CARTG",
    "Cryptoxanthin, alpha": "CRYPXA",
    "Cryptoxanthin, beta": "CRYPXB",
    "Lutein": "LUT",
    "Lutein + zeaxanthin": "LUTZEA",
    "Lycopene": "LYCPN",
    "Zeaxanthin": "ZEA",
    "cis-Lutein/Zeaxanthin": "LUTZEA_CIS",
    "cis-Lycopene": "LYCPN_CIS",
    "trans-Lycopene": "LYCPN_TRANS",
    "cis-beta-Carotene": "CARTB_CIS",
    "trans-beta-Carotene": "CARTB_TRANS",
    "Phytoene": "PHYTO",
    "Phytofluene": "PHYFL",

    # Vitamin D
    "Vitamin D (D2 + D3)": "VITD",
    "Vitamin D (D2 + D3), International Units": "VITD_IU",
    "Vitamin D2 (ergocalciferol)": "ERGCAL",
    "Vitamin D3 (cholecalciferol)": "CHOCAL",
    "Vitamin D4": "VITD4",
    "25-hydroxycholecalciferol": "VITD_25OH",

    # Vitamin E
    "Vitamin E (alpha-tocopherol)": "TOCPHA",
    "Tocopherol, beta": "TOCPHB",
    "Tocopherol, gamma": "TOCPHG",
    "Tocopherol, delta": "TOCPHD",
    "Tocotrienol, alpha": "TOCTRA",
    "Tocotrienol, beta": "TOCTRB",
    "Tocotrienol, gamma": "TOCTRG",
    "Tocotrienol, delta": "TOCTRD",

    # Vitamin K
    "Vitamin K (phylloquinone)": "VITK1",
    "Vitamin K (Menaquinone-4)": "VITK2_MK4",
    "Vitamin K (Dihydrophylloquinone)": "VITK1_DIHYDRO",

    # Vitamins - Water Soluble
    "Vitamin C, total ascorbic acid": "VITC",
    "Thiamin": "THIA",
    "Riboflavin": "RIBF",
    "Niacin": "NIA",
    "Pantothenic acid": "PANTAC",
    "Vitamin B-6": "VITB6A",
    "Biotin": "BIOT",
    "Folate, total": "FOL",
    "10-Formyl folic acid (10HCOFA)": "FOL_10HCOFA",
    "5-Formyltetrahydrofolic acid (5-HCOH4": "FOL_5HCOH4",
    "5-methyl tetrahydrofolate (5-MTHF)": "FOL_5MTHF",
    "Vitamin B-12": "VITB12",
    "Choline, total": "CHOLN",
    "Choline, free": "CHOLN_FREE",
    "Choline, from glycerophosphocholine": "CHOLN_GPC",
    "Choline, from phosphocholine": "CHOLN_PC",
    "Choline, from phosphotidyl choline": "CHOLN_PTDCHO",
    "Choline, from sphingomyelin": "CHOLN_SM",
    "Betaine": "BETN",

    # Amino Acids
    "Alanine": "ALA",
    "Arginine": "ARG",
    "Aspartic acid": "ASP",
    "Cysteine": "CYS",
    "Cystine": "CYSN",
    "Glutamic acid": "GLU",
    "Glycine": "GLY",
    "Histidine": "HIS",
    "Hydroxyproline": "HYP",
    "Isoleucine": "ILE",
    "Leucine": "LEU",
    "Lysine": "LYS",
    "Methionine": "MET",
    "Phenylalanine": "PHE",
    "Proline": "PRO",
    "Serine": "SER",
    "Threonine": "THR",
    "Tryptophan": "TRP",
    "Tyrosine": "TYR",
    "Valine": "VAL",

    # Fatty Acids - Summary
    "Fatty acids, total saturated": "FASAT",
    "Fatty acids, total monounsaturated": "FAMS",
    "Fatty acids, total polyunsaturated": "FAPU",
    "Fatty acids, total trans": "FATRN",
    "Fatty acids, total trans-monoenoic": "FATRN_1",
    "Fatty acids, total trans-dienoic": "FATRN_2",
    "Fatty acids, total trans-polyenoic": "FATRN_P",

    # Saturated Fatty Acids (SFA)
    "SFA 4:0": "F4D0",
    "SFA 5:0": "F5D0",
    "SFA 6:0": "F6D0",
    "SFA 7:0": "F7D0",
    "SFA 8:0": "F8D0",
    "SFA 9:0": "F9D0",
    "SFA 10:0": "F10D0",
    "SFA 11:0": "F11D0",
    "SFA 12:0": "F12D0",
    "SFA 14:0": "F14D0",
    "SFA 15:0": "F15D0",
    "SFA 16:0": "F16D0",
    "SFA 17:0": "F17D0",
    "SFA 18:0": "F18D0",
    "SFA 20:0": "F20D0",
    "SFA 21:0": "F21D0",
    "SFA 22:0": "F22D0",
    "SFA 23:0": "F23D0",
    "SFA 24:0": "F24D0",

    # Monounsaturated Fatty Acids (MUFA)
    "MUFA 12:1": "F12D1",
    "MUFA 14:1 c": "F14D1C",
    "MUFA 15:1": "F15D1",
    "MUFA 16:1 c": "F16D1C",
    "MUFA 17:1": "F17D1",
    "MUFA 17:1 c": "F17D1C",
    "MUFA 18:1": "F18D1",
    "MUFA 18:1 c": "F18D1C",
    "MUFA 20:1": "F20D1",
    "MUFA 20:1 c": "F20D1C",
    "MUFA 22:1": "F22D1",
    "MUFA 22:1 c": "F22D1C",
    "MUFA 22:1 n-9": "F22D1N9",
    "MUFA 22:1 n-11": "F22D1N11",
    "MUFA 24:1 c": "F24D1C",

    # Polyunsaturated Fatty Acids (PUFA)
    "PUFA 18:2": "F18D2",
    "PUFA 18:2 c": "F18D2C",
    "PUFA 18:2 n-6 c,c": "F18D2N6",
    "PUFA 18:2 CLAs": "F18D2_CLA",
    "PUFA 18:3": "F18D3",
    "PUFA 18:3 c": "F18D3C",
    "PUFA 18:3 n-3 c,c,c (ALA)": "F18D3N3",
    "PUFA 18:3 n-6 c,c,c": "F18D3N6",
    "PUFA 18:3i": "F18D3I",
    "PUFA 18:4": "F18D4",
    "PUFA 20:2 c": "F20D2C",
    "PUFA 20:2 n-6 c,c": "F20D2N6",
    "PUFA 20:3": "F20D3",
    "PUFA 20:3 c": "F20D3C",
    "PUFA 20:3 n-3": "F20D3N3",
    "PUFA 20:3 n-6": "F20D3N6",
    "PUFA 20:3 n-9": "F20D3N9",
    "PUFA 20:4": "F20D4",
    "PUFA 20:4c": "F20D4C",
    "PUFA 20:5 n-3 (EPA)": "F20D5N3",
    "PUFA 20:5c": "F20D5C",
    "PUFA 22:2": "F22D2",
    "PUFA 22:3": "F22D3",
    "PUFA 22:4": "F22D4",
    "PUFA 22:5 c": "F22D5C",
    "PUFA 22:5 n-3 (DPA)": "F22D5N3",
    "PUFA 22:6 c": "F22D6C",
    "PUFA 22:6 n-3 (DHA)": "F22D6N3",

    # Trans Fatty Acids (TFA)
    "TFA 14:1 t": "F14D1T",
    "TFA 16:1 t": "F16D1T",
    "TFA 18:1 t": "F18D1T",
    "TFA 18:2 t": "F18D2T",
    "TFA 18:2 t not further defined": "F18D2T_NF",
    "TFA 18:3 t": "F18D3T",
    "TFA 20:1 t": "F20D1T",
    "TFA 22:1 t": "F22D1T",

    # Sterols
    "Cholesterol": "CHOLE",
    "Phytosterols, other": "PHYSTR_OTH",
    "Beta-sitosterol": "SITSTR",
    "Beta-sitostanol": "SITSTRL",
    "Campesterol": "CMPSTR",
    "Campestanol": "CMPSTRL",
    "Stigmasterol": "STGSTR",
    "Stigmastadiene": "STGSTRD",
    "Brassicasterol": "BRSSTR",
    "Delta-5-avenasterol": "D5AVSTR",
    "Delta-7-Stigmastenol": "D7STGSTR",
    "Ergosterol": "ERGSTR",
    "Ergosta-5,7-dienol": "ERG_5_7D",
    "Ergosta-7,22-dienol": "ERG_7_22D",
    "Ergosta-7-enol": "ERG_7EN",

    # Sugars
    "Fructose": "FRUS",
    "Galactose": "GALS",
    "Glucose": "GLUS",
    "Lactose": "LACS",
    "Maltose": "MALS",
    "Sucrose": "SUCS",
    "Raffinose": "RAFS",
    "Stachyose": "STAS",
    "Verbascose": "VERS",
    "Starch": "STARCH",
    "Resistant starch": "STARCH_RES",
    "Beta-glucan": "BETAGLC",

    # Organic Acids
    "Citric acid": "CITAC",
    "Malic acid": "MALAC",
    "Oxalic acid": "OXALAC",
    "Pyruvic acid": "PYRAC",
    "Quinic acid": "QUINAC",

    # Isoflavones
    "Daidzein": "DAIDZE",
    "Daidzin": "DAIDZN",
    "Genistein": "GENIST",
    "Genistin": "GENISTN",
    "Glycitin": "GLYCTN",

    # Other
    "Glutathione": "GLUTH",
    "Ergothioneine": "ERGTHIO",
    "Specific Gravity": "SPECGR",
    "High Molecular Weight Dietary Fiber (HMWDF)": "FIB_HMWDF",
    "Low Molecular Weight Dietary Fiber (LMWDF)": "FIB_LMWDF",
}


def generate_code_mapping(conn):
    """
    Generate mapping for all nutrients in the database.
    Returns dict of {uuid: code}
    """
    cursor = conn.cursor()
    cursor.execute("SELECT id, name_en FROM nutrition ORDER BY name_en")
    rows = cursor.fetchall()
    cursor.close()

    uuid_to_code = {}
    unmapped_nutrients = []

    for uuid, name_en in rows:
        if name_en in NUTRIENT_CODE_MAPPING:
            code = NUTRIENT_CODE_MAPPING[name_en]
        else:
            code = "TODO"
            unmapped_nutrients.append(name_en)

        uuid_to_code[uuid] = code

    return uuid_to_code, unmapped_nutrients


def generate_migration_sql(uuid_to_code):
    """Generate SQL migration script."""

    sql = """/*
  Migration: Convert nutrition.id from UUID to INFOODS tagname codes

  This migration:
  1. Adds 'code' column to nutrition table
  2. Populates codes based on INFOODS standard
  3. Updates foreign key references in food_nutrition
  4. Replaces UUID primary key with code-based primary key

  IMPORTANT: Nutrients marked as 'TODO' need manual code assignment
*/

-- Step 1: Add code column to nutrition table
ALTER TABLE "nutrition" ADD COLUMN "code" TEXT;

-- Step 2: Populate codes for each nutrient
"""

    # Add UPDATE statements for each nutrient
    for uuid, code in uuid_to_code.items():
        sql += f"UPDATE \"nutrition\" SET code = '{code}' WHERE id = '{uuid}';\n"

    sql += """
-- Step 3: Check for duplicate codes (should only be TODO entries)
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT code, COUNT(*) as cnt
        FROM nutrition
        WHERE code != 'TODO'
        GROUP BY code
        HAVING COUNT(*) > 1
    ) duplicates;

    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'Duplicate nutrition codes found! Please review mapping.';
    END IF;
END $$;

-- Step 4: Add new primary key constraint (will fail if TODO codes exist)
-- First, ensure no TODO codes remain
DO $$
DECLARE
    todo_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO todo_count FROM nutrition WHERE code = 'TODO';

    IF todo_count > 0 THEN
        RAISE NOTICE 'Found % nutrients with code=TODO. Please assign proper codes before proceeding.', todo_count;
        RAISE EXCEPTION 'Cannot proceed with TODO codes. Please fix manually first.';
    END IF;
END $$;

-- Step 5: Create temporary mapping table for food_nutrition updates
CREATE TEMP TABLE nutrition_code_mapping AS
SELECT id as old_id, code as new_id FROM nutrition;

-- Step 6: Add new nutrition_code column to food_nutrition
ALTER TABLE "food_nutrition" ADD COLUMN "nutrition_code" TEXT;

-- Step 7: Populate new nutrition_code from mapping
UPDATE "food_nutrition" fn
SET nutrition_code = ncm.new_id
FROM nutrition_code_mapping ncm
WHERE fn.nutrition_id = ncm.old_id;

-- Step 8: Verify all records were updated
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count FROM food_nutrition WHERE nutrition_code IS NULL;

    IF null_count > 0 THEN
        RAISE EXCEPTION 'Found % food_nutrition records without nutrition_code!', null_count;
    END IF;
END $$;

-- Step 9: Drop old foreign key constraint
ALTER TABLE "food_nutrition" DROP CONSTRAINT "food_nutrition_nutrition_id_fkey";

-- Step 10: Drop old nutrition_id column
ALTER TABLE "food_nutrition" ALTER COLUMN "nutrition_id" DROP NOT NULL;
ALTER TABLE "food_nutrition" RENAME COLUMN "nutrition_id" TO "nutrition_id_old";
ALTER TABLE "food_nutrition" RENAME COLUMN "nutrition_code" TO "nutrition_id";

-- Step 11: Make new nutrition_id NOT NULL
ALTER TABLE "food_nutrition" ALTER COLUMN "nutrition_id" SET NOT NULL;

-- Step 12: Drop old UUID primary key from nutrition
ALTER TABLE "nutrition" DROP CONSTRAINT "nutrition_pkey";
ALTER TABLE "nutrition" RENAME COLUMN "id" TO "id_old";
ALTER TABLE "nutrition" RENAME COLUMN "code" TO "id";

-- Step 13: Add new code-based primary key
ALTER TABLE "nutrition" ADD PRIMARY KEY ("id");

-- Step 14: Re-add foreign key constraint with new code-based reference
ALTER TABLE "food_nutrition"
    ADD CONSTRAINT "food_nutrition_nutrition_id_fkey"
    FOREIGN KEY ("nutrition_id")
    REFERENCES "nutrition"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- Step 15: Re-create unique constraint on food_nutrition
ALTER TABLE "food_nutrition" DROP CONSTRAINT IF EXISTS "food_nutrition_food_id_nutrition_id_key";
DROP INDEX IF EXISTS "food_nutrition_food_id_nutrition_id_old_key";

-- First drop the old unique constraint that uses nutrition_id_old
DO $$
BEGIN
    -- Try to drop by the old column combination
    EXECUTE 'ALTER TABLE food_nutrition DROP CONSTRAINT IF EXISTS food_nutrition_food_id_nutrition_id_old_key';
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Now add the new unique constraint with the updated nutrition_id
ALTER TABLE "food_nutrition"
    ADD CONSTRAINT "food_nutrition_food_id_nutrition_id_key"
    UNIQUE ("food_id", "nutrition_id");

-- Step 16: Clean up old columns
ALTER TABLE "nutrition" DROP COLUMN "id_old";
ALTER TABLE "food_nutrition" DROP COLUMN "nutrition_id_old";

-- Step 17: Add index on nutrition.id for performance
CREATE INDEX IF NOT EXISTS "nutrition_id_idx" ON "nutrition"("id");

-- Step 18: Verify migration success
DO $$
DECLARE
    nutrition_count INTEGER;
    food_nutrition_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO nutrition_count FROM nutrition;
    SELECT COUNT(*) INTO food_nutrition_count FROM food_nutrition;

    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Nutrition entries: %', nutrition_count;
    RAISE NOTICE 'Food-nutrition relationships: %', food_nutrition_count;
END $$;
"""

    return sql


def main():
    print("=" * 70)
    print("Nutrition Code Migration Generator")
    print("Converting UUID to INFOODS tagname codes")
    print("=" * 70)

    # Connect to database
    conn = get_db_connection()

    try:
        # Generate code mapping
        print("\n[*] Generating code mappings...")
        uuid_to_code, unmapped = generate_code_mapping(conn)

        mapped_count = sum(1 for code in uuid_to_code.values() if code != "TODO")
        todo_count = len(unmapped)

        print(f"  [OK] Mapped: {mapped_count} nutrients")
        print(f"  [!] TODO (unmapped): {todo_count} nutrients")

        if unmapped:
            print(f"\n[!] Nutrients needing manual code assignment (marked as 'TODO'):")
            for name in sorted(unmapped):
                print(f"     - {name}")

        # Generate migration SQL
        print(f"\n[*] Generating migration SQL...")
        migration_sql = generate_migration_sql(uuid_to_code)

        # Write to file
        output_dir = Path(__file__).parent.parent.parent / "packages" / "db" / "prisma" / "migrations"
        output_file = output_dir / f"migration_nutrition_codes.sql"

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(migration_sql)

        print(f"  [OK] Migration SQL written to: {output_file}")

        print(f"\n{'=' * 70}")
        print(f"[OK] Migration script generated successfully!")
        print(f"{'=' * 70}")
        print(f"\nNext steps:")
        print(f"1. Review nutrients marked as 'TODO' above")
        print(f"2. Manually assign INFOODS codes for TODO nutrients")
        print(f"3. Update NUTRIENT_CODE_MAPPING in this script")
        print(f"4. Re-run this script to regenerate migration")
        print(f"5. Apply migration: psql < {output_file}")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
