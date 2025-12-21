#!/usr/bin/env python3
"""
Shared configuration for Typesense indexing scripts.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://lifeos:lifeos_dev_password@localhost:5432/lifeos"
)

# Typesense
TYPESENSE_HOST = os.getenv("TYPESENSE_HOST", "localhost")
TYPESENSE_PORT = int(os.getenv("TYPESENSE_PORT", "8108"))
TYPESENSE_PROTOCOL = os.getenv("TYPESENSE_PROTOCOL", "http")
TYPESENSE_API_KEY = os.getenv("TYPESENSE_API_KEY", "xyz123_dev_key")

# Indexing
BATCH_SIZE = 100  # Number of documents to index at once
