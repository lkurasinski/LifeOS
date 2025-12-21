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
    Nutrients are returned as an array of objects.
    """
    cursor = conn.cursor()

    # Query to get foods with nutrients as JSON array
    query = """
        SELECT
            f.id,
            f.fdc_id,
            f.name_en,
            f.name_pl,
            f.scientific_name,
            f.category,
            f.created_at,
            f.updated_at,
            COALESCE(
                json_agg(
                    json_build_object(
                        'name_en', n.name_en,
                        'name_pl', n.name_pl,
                        'unit', n.unit,
                        'value', fn.value
                    )
                    ORDER BY n.name_en
                ) FILTER (WHERE n.id IS NOT NULL),
                '[]'::json
            ) as nutrients
        FROM foods f
        LEFT JOIN food_nutrition fn ON f.id = fn.food_id
        LEFT JOIN nutrition n ON fn.nutrition_id = n.id
        GROUP BY f.id, f.fdc_id, f.name_en, f.name_pl, f.scientific_name, f.category, f.created_at, f.updated_at
        ORDER BY f.created_at DESC
    """

    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()

    foods = []
    for row in rows:
        food = {
            "id": row[0],
            "name_en": row[2],
            "created_at": int(row[6].timestamp()),
            "updated_at": int(row[7].timestamp()),
        }

        # Optional fields
        if row[1]:  # fdc_id
            food["fdc_id"] = row[1]
        if row[3]:  # name_pl
            food["name_pl"] = row[3]
        if row[4]:  # scientific_name
            food["scientific_name"] = row[4]
        if row[5]:  # category
            food["category"] = row[5]

        # Nutrients array
        if row[8] and row[8] != []:
            food["nutrients"] = row[8]

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
