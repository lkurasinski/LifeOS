#!/usr/bin/env python3
"""
Utility functions for Typesense operations.
"""

import logging
import typesense
import psycopg2
from typing import Dict, List
from config import (
    TYPESENSE_HOST,
    TYPESENSE_PORT,
    TYPESENSE_PROTOCOL,
    TYPESENSE_API_KEY,
    DATABASE_URL
)

logger = logging.getLogger(__name__)


def get_typesense_client() -> typesense.Client:
    """Create and return Typesense client."""
    return typesense.Client({
        'nodes': [{
            'host': TYPESENSE_HOST,
            'port': TYPESENSE_PORT,
            'protocol': TYPESENSE_PROTOCOL
        }],
        'api_key': TYPESENSE_API_KEY,
        'connection_timeout_seconds': 5
    })


def get_db_connection():
    """Create and return PostgreSQL connection."""
    # Remove Prisma-specific query parameters (e.g., ?schema=public)
    db_url = DATABASE_URL.split('?')[0]
    return psycopg2.connect(db_url)


def collection_exists(client: typesense.Client, collection_name: str) -> bool:
    """Check if collection exists in Typesense."""
    try:
        client.collections[collection_name].retrieve()
        return True
    except typesense.exceptions.ObjectNotFound:
        return False


def create_collection(client: typesense.Client, schema: Dict):
    """Create collection with given schema."""
    collection_name = schema["name"]

    # Drop if exists
    if collection_exists(client, collection_name):
        logger.info(f"  Dropping existing collection: {collection_name}")
        client.collections[collection_name].delete()

    # Create
    logger.info(f"  Creating collection: {collection_name}")
    client.collections.create(schema)
    logger.info(f"  ✓ Collection created: {collection_name}")


def get_collection_stats(client: typesense.Client, collection_name: str) -> Dict:
    """Get collection statistics."""
    try:
        collection = client.collections[collection_name].retrieve()
        return {
            "name": collection_name,
            "num_documents": collection.get("num_documents", 0),
            "num_fields": len(collection.get("fields", [])),
        }
    except typesense.exceptions.ObjectNotFound:
        return {
            "name": collection_name,
            "num_documents": 0,
            "error": "Collection not found"
        }


def health_check() -> Dict:
    """Check health of Typesense and PostgreSQL."""
    result = {
        "typesense": {"status": "unknown"},
        "postgres": {"status": "unknown"}
    }

    # Check Typesense
    try:
        client = get_typesense_client()
        # Try to retrieve collections - if this works, Typesense is healthy
        client.collections.retrieve()
        result["typesense"] = {
            "status": "healthy"
        }
    except Exception as e:
        result["typesense"] = {
            "status": "error",
            "error": str(e)
        }

    # Check PostgreSQL
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        result["postgres"] = {"status": "healthy"}
    except Exception as e:
        result["postgres"] = {
            "status": "error",
            "error": str(e)
        }

    return result


def batch_index_documents(
    client: typesense.Client,
    collection_name: str,
    documents: List[Dict],
    batch_size: int = 100
):
    """
    Index documents in batches.
    Returns: (successful_count, failed_count)
    """
    total = len(documents)
    successful = 0
    failed = 0

    for i in range(0, total, batch_size):
        batch = documents[i:i + batch_size]

        try:
            results = client.collections[collection_name].documents.import_(batch)

            for result in results:
                if result.get("success"):
                    successful += 1
                else:
                    failed += 1
                    error = result.get("error", "Unknown error")
                    logger.warning(f"  Failed to index document: {error}")

        except Exception as e:
            logger.error(f"  Batch indexing failed: {e}")
            failed += len(batch)

    return successful, failed
