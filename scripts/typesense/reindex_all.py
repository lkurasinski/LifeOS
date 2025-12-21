#!/usr/bin/env python3
"""
Reindex all collections from PostgreSQL to Typesense.
Drops and recreates all collections.
"""

import logging
import subprocess
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


def run_script(script_name: str):
    """Run indexing script."""
    logger.info(f"\n▶ Running {script_name}...")
    result = subprocess.run(
        ["python", script_name],
        capture_output=False
    )

    if result.returncode != 0:
        logger.error(f"✗ {script_name} failed with exit code {result.returncode}")
        sys.exit(result.returncode)


def main():
    """Reindex all collections."""
    logger.info("=" * 60)
    logger.info("Typesense Full Reindex")
    logger.info("=" * 60)
    logger.info("\nThis will:")
    logger.info("  1. Drop existing foods collection")
    logger.info("  2. Recreate collection with current schema")
    logger.info("  3. Index all foods from PostgreSQL")

    # Run indexing script
    run_script("index_foods.py")

    logger.info("\n" + "=" * 60)
    logger.info("✓ Full reindex completed successfully!")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
