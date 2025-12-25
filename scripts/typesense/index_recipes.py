#!/usr/bin/env python3
"""
Index all recipes from PostgreSQL to Typesense.
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
from schema import RECIPES_SCHEMA
from config import BATCH_SIZE

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


def fetch_recipes_with_relations(conn) -> List[Dict]:
    """
    Fetch all public recipes with their ingredients and tags from PostgreSQL.
    Ingredients and tags are returned as arrays of objects.
    """
    cursor = conn.cursor()

    # Query to get recipes with ingredients and tags as JSON arrays
    query = """
        SELECT
            r.id,
            r.user_id,
            u.name as user_name, 
            r.title_pl,
            r.title_en,
            r.description_pl,
            r.description_en,
            r.servings,
            r.prep_time_minutes,
            r.cook_time_minutes,
            r.difficulty,
            r.is_public,
            r.image_url,
            r.created_at,
            r.updated_at,
            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'food_id', f.id,
                        'food_name_pl', f.name_pl,
                        'food_name_en', f.name_en,
                        'amount', ri.amount,
                        'unit', ri.unit,
                        'notes', ri.notes
                    )
                    ORDER BY jsonb_build_object(
                        'food_id', f.id,
                        'food_name_pl', f.name_pl,
                        'food_name_en', f.name_en,
                        'amount', ri.amount,
                        'unit', ri.unit,
                        'notes', ri.notes
                    )
                ) FILTER (WHERE f.id IS NOT NULL),
                '[]'::json
            ) as ingredients,
            COALESCE(
                json_agg(
                    DISTINCT t.name_pl
                    ORDER BY t.name_pl
                ) FILTER (WHERE t.id IS NOT NULL),
                '[]'::json
            ) as tags
        FROM recipes r
        INNER JOIN users u ON r.user_id = u.id
        LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        LEFT JOIN foods f ON ri.food_id = f.id
        LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
        LEFT JOIN tags t ON rt.tag_id = t.id
        WHERE r.is_public = true
        GROUP BY r.id, r.user_id, u.name, r.title_pl, r.title_en, r.description_pl,
                 r.description_en, r.servings, r.prep_time_minutes, r.cook_time_minutes,
                 r.difficulty, r.is_public, r.image_url, r.created_at, r.updated_at
        ORDER BY r.created_at DESC
    """

    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()

    recipes = []
    for row in rows:
        recipe = {
            "id": row[0],
            "user_id": row[1],
            "title_pl": row[3],
            "servings": row[7],
            "is_public": row[11],
            "created_at": int(row[13].timestamp()),
            "updated_at": int(row[14].timestamp()),
        }

        # Optional fields
        if row[2]:  # user_name
            recipe["user_name"] = row[2]
        if row[4]:  # title_en
            recipe["title_en"] = row[4]
        if row[5]:  # description_pl
            recipe["description_pl"] = row[5]
        if row[6]:  # description_en
            recipe["description_en"] = row[6]
        if row[8]:  # prep_time_minutes
            recipe["prep_time_minutes"] = row[8]
        if row[9]:  # cook_time_minutes
            recipe["cook_time_minutes"] = row[9]
        if row[10]:  # difficulty
            recipe["difficulty"] = row[10]
        if row[12]:  # image_url
            recipe["image_url"] = row[12]

        # Ingredients array
        if row[15] and row[15] != []:
            recipe["ingredients"] = row[15]

        # Tags array
        if row[16] and row[16] != []:
            recipe["tags"] = row[16]

        recipes.append(recipe)

    return recipes


def main():
    """Main indexing process for recipes."""
    logger.info("=" * 60)
    logger.info("Typesense Recipes Indexing")
    logger.info("=" * 60)

    # Connect to services
    logger.info("\n🔌 Connecting to services...")
    client = get_typesense_client()
    conn = get_db_connection()

    try:
        # Create/recreate collection
        logger.info("\n📦 Setting up collection...")
        create_collection(client, RECIPES_SCHEMA)

        # Fetch recipes from database
        logger.info("\n📖 Fetching recipes from PostgreSQL...")
        recipes = fetch_recipes_with_relations(conn)
        logger.info(f"  ✓ Fetched {len(recipes)} public recipes")

        if not recipes:
            logger.warning("  ⚠ No recipes to index")
            return

        # Index to Typesense
        logger.info(f"\n🔍 Indexing {len(recipes)} recipes to Typesense...")
        successful, failed = batch_index_documents(
            client,
            "recipes",
            recipes,
            BATCH_SIZE
        )

        logger.info(f"\n✓ Indexing completed!")
        logger.info(f"  Successful: {successful}")
        logger.info(f"  Failed: {failed}")
        logger.info(f"  Success rate: {successful / len(recipes) * 100:.1f}%")

        logger.info("\n" + "=" * 60)
        logger.info("✓ Recipes indexing completed successfully!")
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
