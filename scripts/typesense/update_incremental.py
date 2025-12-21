#!/usr/bin/env python3
"""
Incremental update of Typesense from PostgreSQL.
Only updates documents that changed since last update.
"""

import logging
import sys
from datetime import datetime, timedelta
from typing import List, Dict

from utils import (
    get_typesense_client,
    get_db_connection,
    batch_index_documents
)
from index_foods import fetch_foods_with_nutrition
from index_nutrition import fetch_nutrition
from config import BATCH_SIZE

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


def fetch_updated_foods(conn, since_hours: int = 24) -> List[Dict]:
    """
    Fetch foods updated in last N hours.
    Uses the same structure as full index.
    """
    cursor = conn.cursor()

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
        WHERE f.updated_at >= NOW() - INTERVAL '%s hours'
        GROUP BY f.id, f.fdc_id, f.name_en, f.name_pl, f.scientific_name, f.category, f.created_at, f.updated_at
        ORDER BY f.updated_at DESC
    """

    cursor.execute(query, (since_hours,))
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


def main(since_hours: int = 24):
    """
    Main incremental update process.
    Args:
        since_hours: Number of hours to look back for changes
    """
    logger.info("=" * 60)
    logger.info("Typesense Incremental Update")
    logger.info("=" * 60)
    logger.info(f"Looking for changes in last {since_hours} hours")

    # Connect to services
    logger.info("\n🔌 Connecting to services...")
    client = get_typesense_client()
    conn = get_db_connection()

    total_updated = 0

    try:
        # Update foods
        logger.info(f"\n🍎 Fetching updated foods (last {since_hours}h)...")
        foods = fetch_updated_foods(conn, since_hours)
        logger.info(f"  Found {len(foods)} updated foods")

        if foods:
            logger.info(f"  Indexing {len(foods)} foods...")
            successful, failed = batch_index_documents(
                client,
                "foods",
                foods,
                BATCH_SIZE
            )
            logger.info(f"  ✓ Foods: {successful} updated, {failed} failed")
            total_updated += successful

        logger.info("\n" + "=" * 60)
        logger.info(f"✓ Incremental update completed!")
        logger.info(f"  Total documents updated: {total_updated}")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"\n✗ Update failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    finally:
        conn.close()
        logger.info("Database connection closed")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Incremental Typesense update")
    parser.add_argument(
        "--hours",
        type=int,
        default=24,
        help="Number of hours to look back for changes (default: 24)"
    )

    args = parser.parse_args()
    main(since_hours=args.hours)
