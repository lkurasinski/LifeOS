#!/usr/bin/env python3
"""
Index all foods from PostgreSQL to Typesense.
"""

import logging
import sys
from datetime import datetime
from typing import Dict, List

from utils import (
    get_typesense_client,
    get_db_connection,
    collection_exists,
    create_collection,
    batch_index_documents
)
from schema import FOODS_SCHEMA
from config import BATCH_SIZE

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


def fetch_foods_with_nutrition(conn) -> List[Dict]:
    """
    Fetch all foods with their nutrients from PostgreSQL.
    Nutrients are returned as a flat object with INFOODS codes as keys.
    Common nutrients are denormalized for fast sorting/filtering.
    """
    cursor = conn.cursor()

    # Query to get foods with nutrients as JSON object with INFOODS codes
    query = """
        SELECT
            f.id,
            f.name_en,
            f.name_pl,
            f.scientific_name,
            f.category,
            f.brand,
            f.source_provider,
            f.source_external_id,
            f.source_url,
            f.created_at,
            f.updated_at,
            COALESCE(
                json_object_agg(
                    n.id, fn.amount
                ) FILTER (WHERE n.id IS NOT NULL),
                '{}'::json
            ) as nutrients
        FROM foods f
        LEFT JOIN food_nutrition fn ON f.id = fn.food_id
        LEFT JOIN nutrition n ON fn.nutrition_id = n.id
        GROUP BY f.id, f.name_en, f.name_pl, f.scientific_name, f.category, f.brand,
                 f.source_provider, f.source_external_id, f.source_url, f.created_at, f.updated_at
        ORDER BY f.created_at DESC
    """

    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()

    foods = []
    for row in rows:
        food = {
            "id": str(row[0]),  # Typesense requires ID as string
            "name_en": row[1],
            "created_at": int(row[9].timestamp()),
            "updated_at": int(row[10].timestamp()),
        }

        # Optional fields
        if row[2]:  # name_pl
            food["name_pl"] = row[2]
        if row[3]:  # scientific_name
            food["scientific_name"] = row[3]
        if row[4]:  # category
            food["category"] = row[4]
        if row[5]:  # brand
            food["brand"] = row[5]
        if row[6]:  # source_provider
            food["source_provider"] = row[6]
        if row[7]:  # source_external_id
            food["source_external_id"] = row[7]
        if row[8]:  # source_url
            food["source_url"] = row[8]

        # Nutrients object with INFOODS codes
        nutrients = row[11] if row[11] else {}
        if nutrients:
            # Convert all values to float to ensure consistent typing in Typesense
            # (prevents int64 type inference issues)
            nutrients_float = {k: float(v) for k, v in nutrients.items()}

            # Backfill general energy from specific Atwater values if available
            # Priority: ENERC_ASF_kcal > ENERC_AGF_kcal > ENERA_kcal > ENERC_kcal
            if "ENERC_kcal" not in nutrients_float and "ENERA_kcal" not in nutrients_float:
                if "ENERC_ASF_kcal" in nutrients_float:
                    nutrients_float["ENERC_kcal"] = nutrients_float["ENERC_ASF_kcal"]
                elif "ENERC_AGF_kcal" in nutrients_float:
                    nutrients_float["ENERC_kcal"] = nutrients_float["ENERC_AGF_kcal"]
                elif "ENERA_kcal" in nutrients_float:
                    nutrients_float["ENERC_kcal"] = nutrients_float["ENERA_kcal"]

            food["nutrients"] = nutrients_float

            # Extract common nutrients for denormalized fields (fast sorting/filtering)
            # Using current database INFOODS codes with unit suffixes

            # Energy with Atwater priority: ENERC_ASF_kcal > ENERC_AGF_kcal > ENERA_kcal > ENERC_kcal
            energy = (
                nutrients_float.get("ENERC_ASF_kcal") or
                nutrients_float.get("ENERC_AGF_kcal")
            )
            if energy is not None:
                food["energy_kcal"] = float(energy)

            # Protein: PROTCNT_g (total protein)
            if "PROTCNT_g" in nutrients_float:
                food["protein"] = float(nutrients_float["PROTCNT_g"])

            # Fat: FAT_g (total lipid/fat)
            if "FAT_g" in nutrients_float:
                food["fat"] = float(nutrients_float["FAT_g"])

            # Carbohydrates: CHOCDF_g (carbohydrate by difference) or CHOAVL_g (by summation)
            carbs = nutrients_float.get("CHOCDF_g") or nutrients_float.get("CHOAVL_g")
            if carbs is not None:
                food["carbs"] = float(carbs)

            # Fiber: FIBTG_g (total dietary fiber)
            if "FIBTG_g" in nutrients_float:
                food["fiber"] = float(nutrients_float["FIBTG_g"])

        foods.append(food)

    return foods


def main():
    """Main indexing process for foods."""
    logger.info("=" * 60)
    logger.info("Typesense Foods Indexing")
    logger.info("=" * 60)

    # Connect to services
    logger.info("\n🔌 Connecting to services...")
    client = get_typesense_client()
    conn = get_db_connection()

    try:
        # Create/recreate collection
        logger.info("\n📦 Setting up collection...")
        create_collection(client, FOODS_SCHEMA)

        # Fetch foods from database
        logger.info("\n📖 Fetching foods from PostgreSQL...")
        foods = fetch_foods_with_nutrition(conn)
        logger.info(f"  ✓ Fetched {len(foods)} foods")

        if not foods:
            logger.warning("  ⚠ No foods to index")
            return

        # Index to Typesense
        logger.info(f"\n🔍 Indexing {len(foods)} foods to Typesense...")
        successful, failed = batch_index_documents(
            client,
            "foods",
            foods,
            BATCH_SIZE
        )

        logger.info(f"\n✓ Indexing completed!")
        logger.info(f"  Successful: {successful}")
        logger.info(f"  Failed: {failed}")
        logger.info(f"  Success rate: {successful / len(foods) * 100:.1f}%")

        logger.info("\n" + "=" * 60)
        logger.info("✓ Foods indexing completed successfully!")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"\n✗ Indexing failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    finally:
        conn.close()
        logger.info("Database connection closed")


if __name__ == "__main__":
    main()
