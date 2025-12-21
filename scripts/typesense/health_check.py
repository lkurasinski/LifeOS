#!/usr/bin/env python3
"""
Health check for Typesense and PostgreSQL.
Shows status and statistics for all collections.
"""

import logging
import json
from utils import (
    get_typesense_client,
    health_check,
    get_collection_stats
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


def main():
    """Run health check."""
    logger.info("=" * 60)
    logger.info("Typesense Health Check")
    logger.info("=" * 60)

    # Service health
    logger.info("\n🏥 Checking service health...")
    health = health_check()

    typesense_status = health["typesense"]["status"]
    postgres_status = health["postgres"]["status"]

    logger.info(f"  Typesense: {typesense_status}")
    if typesense_status != "healthy":
        logger.error(f"    Error: {health['typesense'].get('error', 'Unknown')}")

    logger.info(f"  PostgreSQL: {postgres_status}")
    if postgres_status != "healthy":
        logger.error(f"    Error: {health['postgres'].get('error', 'Unknown')}")

    # Collection statistics
    if typesense_status == "healthy":
        logger.info("\n📊 Collection Statistics:")
        client = get_typesense_client()

        stats = get_collection_stats(client, "foods")

        if "error" in stats:
            logger.warning(f"  foods: {stats['error']}")
        else:
            logger.info(f"  foods:")
            logger.info(f"    Documents: {stats['num_documents']}")
            logger.info(f"    Fields: {stats['num_fields']}")

    # Overall status
    logger.info("\n" + "=" * 60)
    if typesense_status == "healthy" and postgres_status == "healthy":
        logger.info("✓ All services healthy")
    else:
        logger.error("✗ Some services unhealthy")
        return 1

    logger.info("=" * 60)
    return 0


if __name__ == "__main__":
    exit(main())
