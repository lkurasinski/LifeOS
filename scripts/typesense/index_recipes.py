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
            r.slug,
            r.user_id,
            u.name as user_name,
            r.name_pl,
            r.name_en,
            r.description_pl,
            r.description_en,
            r.servings,
            r.prep_time_minutes,
            r.cook_time_minutes,
            r.difficulty,
            r.is_public,
            r.image_url,
            r.awesomeness,
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
                array_agg(
                    DISTINCT ingredient_name
                    ORDER BY ingredient_name
                ) FILTER (WHERE ingredient_name IS NOT NULL),
                ARRAY[]::text[]
            ) as ingredient_names,
            COALESCE(
                array_agg(
                    DISTINCT sr.slug
                    ORDER BY sr.slug
                ) FILTER (WHERE sr.slug IS NOT NULL),
                ARRAY[]::text[]
            ) as sub_recipe_slugs,
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
        LEFT JOIN LATERAL (
            SELECT unnest(ARRAY[f.name_pl, f.name_en]) as ingredient_name
            WHERE f.id IS NOT NULL
        ) ingredient_names_flat ON true
        LEFT JOIN recipe_sub_recipes rsr ON r.id = rsr.recipe_id
        LEFT JOIN recipes sr ON rsr.sub_recipe_id = sr.id
        LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
        LEFT JOIN tags t ON rt.tag_id = t.id
        WHERE r.is_public = true
        GROUP BY r.id, r.slug, r.user_id, u.name, r.name_pl, r.name_en, r.description_pl,
                 r.description_en, r.servings, r.prep_time_minutes, r.cook_time_minutes,
                 r.difficulty, r.is_public, r.image_url, r.awesomeness, r.created_at, r.updated_at
        ORDER BY r.created_at DESC
    """

    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()

    recipes = []
    for row in rows:
        recipe = {
            "id": row[0],
            "slug": row[1],
            "user_id": row[2],
            "name_pl": row[4],
            "servings": row[8],
            "is_public": row[12],
            "created_at": int(row[15].timestamp()),
            "updated_at": int(row[16].timestamp()),
        }

        # Optional fields
        if row[3]:  # user_name
            recipe["user_name"] = row[3]
        if row[5]:  # name_en
            recipe["name_en"] = row[5]
        if row[6]:  # description_pl
            recipe["description_pl"] = row[6]
        if row[7]:  # description_en
            recipe["description_en"] = row[7]
        if row[9]:  # prep_time_minutes
            recipe["prep_time_minutes"] = row[9]
        if row[10]:  # cook_time_minutes
            recipe["cook_time_minutes"] = row[10]
        if row[11]:  # difficulty
            recipe["difficulty"] = row[11]
        if row[13]:  # image_url
            recipe["image_url"] = row[13]
        if row[14]:  # awesomeness
            recipe["awesomeness"] = row[14]

        # Ingredients array
        if row[17] and row[17] != []:
            recipe["ingredients"] = row[17]

        # Ingredient names flat array
        if row[18] and len(row[18]) > 0:
            recipe["ingredient_names"] = [name for name in row[18] if name]

        # Sub-recipe slugs array
        if row[19] and len(row[19]) > 0:
            recipe["sub_recipe_slugs"] = row[19]

        # Tags array
        if row[20] and row[20] != []:
            recipe["tags"] = row[20]

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
