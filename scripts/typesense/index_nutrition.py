#!/usr/bin/env python3
"""
Index all nutrition entries from PostgreSQL to Typesense.
"""

import logging
import sys
from typing import Dict, List

from utils import (
    get_typesense_client,
    get_db_connection,
    create_collection,
    batch_index_documents
)
from schema import NUTRITION_SCHEMA
from config import BATCH_SIZE

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


def categorize_nutrient(name: str) -> str:
    """Categorize nutrient by name."""
    name_lower = name.lower()

    if "vitamin" in name_lower or "tocopherol" in name_lower or "folate" in name_lower:
        return "vitamins"
    elif any(mineral in name_lower for mineral in [
        "calcium", "iron", "magnesium", "phosphorus",
        "potassium", "sodium", "zinc", "copper", "manganese", "selenium"
    ]):
        return "minerals"
    elif "energy" in name_lower or "kcal" in name_lower or "kj" in name_lower:
        return "energy"
    elif any(macro in name_lower for macro in ["protein", "carbohydrate", "fat", "fiber", "sugar"]):
        return "macronutrients"
    elif any(fatty in name_lower for fatty in ["fatty", "saturated", "monounsaturated", "polyunsaturated"]):
        return "fatty_acids"
    elif "amino" in name_lower:
        return "amino_acids"
    else:
        return "other"


def fetch_nutrition(conn) -> List[Dict]:
    """Fetch all nutrition entries from PostgreSQL."""
    cursor = conn.cursor()

    query = """
        SELECT
            id,
            name_en,
            name_pl,
            unit
        FROM nutrition
        ORDER BY name_en
    """

    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()

    nutrition_entries = []
    for row in rows:
        entry = {
            "id": row[0],
            "name_en": row[1],
            "unit": row[3],
            "category": categorize_nutrient(row[1])
        }

        if row[2]:  # name_pl
            entry["name_pl"] = row[2]

        nutrition_entries.append(entry)

    return nutrition_entries


def main():
    """Main indexing process for nutrition."""
    logger.info("=" * 60)
    logger.info("Typesense Nutrition Indexing")
    logger.info("=" * 60)

    # Connect to services
    logger.info("\n🔌 Connecting to services...")
    client = get_typesense_client()
    conn = get_db_connection()

    try:
        # Create/recreate collection
        logger.info("\n📦 Setting up collection...")
        create_collection(client, NUTRITION_SCHEMA)

        # Fetch nutrition from database
        logger.info("\n📖 Fetching nutrition entries from PostgreSQL...")
        nutrition = fetch_nutrition(conn)
        logger.info(f"  ✓ Fetched {len(nutrition)} nutrition entries")

        if not nutrition:
            logger.warning("  ⚠ No nutrition entries to index")
            return

        # Index to Typesense
        logger.info(f"\n🔍 Indexing {len(nutrition)} nutrition entries to Typesense...")
        successful, failed = batch_index_documents(
            client,
            "nutrition",
            nutrition,
            BATCH_SIZE
        )

        logger.info(f"\n✓ Indexing completed!")
        logger.info(f"  Successful: {successful}")
        logger.info(f"  Failed: {failed}")
        logger.info(f"  Success rate: {successful / len(nutrition) * 100:.1f}%")

        logger.info("\n" + "=" * 60)
        logger.info("✓ Nutrition indexing completed successfully!")
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
