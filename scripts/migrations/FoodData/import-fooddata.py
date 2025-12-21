#!/usr/bin/env python3
"""
FoodData Central → PostgreSQL Migration Script
Imports foods and nutrition data from USDA FoodData JSON to LifeOS database.
"""

import json
import logging
import os
from pathlib import Path
from typing import Dict, List, Set
import psycopg2
from psycopg2.extras import execute_values

# Configuration
INPUT_FILE = Path("../../../oos/fd-foundation.json")  # FoodData Central JSON file
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://lifeos:lifeos_dev_password@localhost:5432/lifeos"
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

logger = logging.getLogger(__name__)


def connect_db():
    """Connect to PostgreSQL database."""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        logger.info("✓ Connected to database")
        return conn
    except Exception as e:
        logger.error(f"✗ Database connection failed: {e}")
        raise


def get_database_stats(conn) -> Dict[str, int]:
    """Get current database statistics."""
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM nutrition")
    nutrition_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM foods")
    foods_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM food_nutrition")
    food_nutrition_count = cursor.fetchone()[0]

    cursor.close()

    return {
        "nutrition": nutrition_count,
        "foods": foods_count,
        "food_nutrition": food_nutrition_count
    }


def extract_unique_nutrients(foods_data: List[Dict]) -> Dict[str, Dict]:
    """
    Extract unique nutrients from all foods.
    Returns: { 'Protein|g': { 'name': 'Protein', 'unit': 'g' }, ... }
    """
    nutrients_map = {}

    for food in foods_data:
        food_nutrients = food.get("foodNutrients", [])
        for fn in food_nutrients:
            nutrient = fn.get("nutrient", {})
            name_en = nutrient.get("name")
            unit = nutrient.get("unitName")

            if name_en and unit:
                key = f"{name_en}|{unit}"
                if key not in nutrients_map:
                    nutrients_map[key] = {
                        "nameEn": name_en,
                        "unit": unit
                    }

    logger.info(f"✓ Extracted {len(nutrients_map)} unique nutrients")
    return nutrients_map


def insert_nutrition(conn, nutrients_map: Dict) -> Dict[str, str]:
    """
    Insert nutrition catalog into database.
    Returns: { 'Protein|g': 'uuid-123', ... } (mapping key → nutrition_id)
    """
    cursor = conn.cursor()
    nutrition_ids = {}

    # Prepare data
    nutrition_data = [
        (data["nameEn"], data["unit"])
        for data in nutrients_map.values()
    ]

    # Insert and get IDs
    query = """
        INSERT INTO nutrition (id, name_en, unit)
        VALUES (gen_random_uuid(), %s, %s)
        ON CONFLICT (name_en, unit) DO UPDATE SET name_en = EXCLUDED.name_en
        RETURNING id, name_en, unit
    """

    for name_en, unit in nutrition_data:
        cursor.execute(query, (name_en, unit))
        result = cursor.fetchone()
        if result:
            nutrition_id, ret_name, ret_unit = result
            key = f"{ret_name}|{ret_unit}"
            nutrition_ids[key] = nutrition_id

    conn.commit()
    logger.info(f"✓ Inserted {len(nutrition_ids)} nutrition entries")
    cursor.close()

    return nutrition_ids


def insert_foods(conn, foods_data: List[Dict], nutrition_ids: Dict[str, str]):
    """
    Insert foods and their nutrition values.
    """
    cursor = conn.cursor()

    foods_inserted = 0
    nutrition_values_inserted = 0

    for idx, food in enumerate(foods_data, 1):
        fdc_id = food.get("fdcId")
        description = food.get("description")
        category = food.get("foodCategory", {}).get("description")
        scientific_name = food.get("scientificName")

        if not fdc_id or not description:
            continue

        # Insert food
        food_query = """
            INSERT INTO foods (
                id,
                fdc_id,
                name_en,
                scientific_name,
                category,
                is_custom,
                created_at,
                updated_at
            )
            VALUES (
                gen_random_uuid(),
                %s,  -- fdc_id
                %s,  -- name_en (description)
                %s,  -- scientific_name
                %s,  -- category
                false,
                NOW(),
                NOW()
            )
            ON CONFLICT (fdc_id) DO UPDATE SET
                name_en = EXCLUDED.name_en,
                category = EXCLUDED.category,
                scientific_name = EXCLUDED.scientific_name
            RETURNING id
        """

        try:
            cursor.execute(food_query, (fdc_id, description, scientific_name, category))
            food_id_row = cursor.fetchone()
            if not food_id_row:
                continue

            food_id = food_id_row[0]
            foods_inserted += 1

            # Insert food nutrition values
            food_nutrients = food.get("foodNutrients", [])
            nutrition_values = []

            for fn in food_nutrients:
                nutrient = fn.get("nutrient", {})
                amount = fn.get("amount")

                name_en = nutrient.get("name")
                unit = nutrient.get("unitName")

                if name_en and unit and amount is not None:
                    key = f"{name_en}|{unit}"
                    nutrition_id = nutrition_ids.get(key)

                    if nutrition_id:
                        nutrition_values.append((food_id, nutrition_id, float(amount)))

            if nutrition_values:
                nutrition_query = """
                    INSERT INTO food_nutrition (id, food_id, nutrition_id, value)
                    VALUES (gen_random_uuid(), %s, %s, %s)
                    ON CONFLICT (food_id, nutrition_id) DO UPDATE SET value = EXCLUDED.value
                """
                cursor.executemany(nutrition_query, nutrition_values)
                nutrition_values_inserted += len(nutrition_values)

            # Progress log
            if idx % 100 == 0:
                logger.info(f"  Processed {idx}/{len(foods_data)} foods...")
                conn.commit()

        except Exception as e:
            logger.warning(f"  Skipped food {fdc_id}: {e}")
            conn.rollback()
            continue

    conn.commit()
    cursor.close()

    logger.info(f"✓ Inserted {foods_inserted} foods")
    logger.info(f"✓ Inserted {nutrition_values_inserted} nutrition values")


def main():
    """Main migration process."""
    logger.info("=" * 60)
    logger.info("FoodData Central → PostgreSQL Migration")
    logger.info("=" * 60)

    # Check input file
    if not INPUT_FILE.exists():
        logger.error(f"✗ Input file not found: {INPUT_FILE}")
        logger.info(f"  Please ensure the file exists at: {INPUT_FILE.absolute()}")
        return

    logger.info(f"📁 Input file: {INPUT_FILE}")

    # Load data
    logger.info("📖 Loading FoodData JSON...")
    foods_data = []

    try:
        with INPUT_FILE.open("r", encoding="utf-8") as f:
            # Try to detect format
            first_char = f.read(1)
            f.seek(0)

            if first_char == '[':
                # JSON Array format: [{...}, {...}, ...]
                logger.info("  Detected JSON array format")
                data = json.load(f)
                if isinstance(data, list):
                    foods_data = data
                else:
                    logger.error("✗ Expected JSON array, got object")
                    return

            elif first_char == '{':
                # JSON Object format: {"SurveyFoods": [{...}, ...]}
                logger.info("  Detected JSON object format")
                data = json.load(f)

                # Try common keys
                if "FoundationFoods" in data:
                    foods_data = data["FoundationFoods"]
                elif "foods" in data:
                    foods_data = data["foods"]
                elif isinstance(data, dict):
                    # Single food object
                    foods_data = [data]
                else:
                    logger.error("✗ Unknown JSON structure")
                    return

            else:
                # JSONL format (one JSON per line)
                logger.info("  Detected JSONL format")
                f.seek(0)
                for line_no, line in enumerate(f, 1):
                    line = line.strip()
                    if not line:
                        continue

                    try:
                        food = json.loads(line)
                        foods_data.append(food)
                    except json.JSONDecodeError as e:
                        logger.warning(f"  Skipped invalid JSON at line {line_no}: {e}")
                        continue

                    # Progress
                    if line_no % 1000 == 0:
                        logger.info(f"  Loaded {line_no} records...")

    except Exception as e:
        logger.error(f"✗ Failed to load file: {e}")
        return

    logger.info(f"✓ Loaded {len(foods_data)} food records")

    if not foods_data:
        logger.warning("⚠ No data to import")
        return

    # Connect to database
    conn = connect_db()

    try:
        # Get database stats before migration
        logger.info("\n📈 Database statistics (before):")
        stats_before = get_database_stats(conn)
        logger.info(f"  Nutrition entries: {stats_before['nutrition']}")
        logger.info(f"  Foods: {stats_before['foods']}")
        logger.info(f"  Food-Nutrition links: {stats_before['food_nutrition']}")

        # Step 1: Extract unique nutrients
        logger.info("\n📊 Step 1: Extracting unique nutrients from source...")
        nutrients_map = extract_unique_nutrients(foods_data)

        # Step 2: Insert nutrition catalog
        logger.info("\n💉 Step 2: Inserting/updating nutrition catalog...")
        nutrition_ids = insert_nutrition(conn, nutrients_map)

        # Step 3: Insert foods and values
        logger.info(f"\n🍎 Step 3: Inserting/updating {len(foods_data)} foods...")
        insert_foods(conn, foods_data, nutrition_ids)

        # Get database stats after migration
        logger.info("\n📈 Database statistics (after):")
        stats_after = get_database_stats(conn)
        logger.info(f"  Nutrition entries: {stats_after['nutrition']}")
        logger.info(f"  Foods: {stats_after['foods']}")
        logger.info(f"  Food-Nutrition links: {stats_after['food_nutrition']}")

        # Calculate changes
        logger.info("\n📊 Changes:")
        logger.info(f"  New nutrition entries: +{stats_after['nutrition'] - stats_before['nutrition']}")
        logger.info(f"  New foods: +{stats_after['foods'] - stats_before['foods']}")
        logger.info(f"  New food-nutrition links: +{stats_after['food_nutrition'] - stats_before['food_nutrition']}")

        logger.info("\n" + "=" * 60)
        logger.info("✓ Migration completed successfully!")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"\n✗ Migration failed: {e}")
        conn.rollback()
        raise

    finally:
        conn.close()
        logger.info("Database connection closed")


if __name__ == "__main__":
    main()
