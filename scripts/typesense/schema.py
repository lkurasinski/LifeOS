#!/usr/bin/env python3
"""
Typesense collection schema definitions.
"""

# Foods collection schema
FOODS_SCHEMA = {
    "name": "foods",
    "enable_nested_fields": True,
    "fields": [
        {"name": "id", "type": "string"},
        {"name": "fdc_id", "type": "int32", "optional": True},
        {"name": "name_en", "type": "string"},
        {"name": "name_pl", "type": "string", "optional": True},
        {"name": "scientific_name", "type": "string", "optional": True},
        {"name": "category", "type": "string", "facet": True, "optional": True},
        {"name": "nutrients", "type": "object[]", "optional": True},
        {"name": "created_at", "type": "int64"},
        {"name": "updated_at", "type": "int64"},
    ],
    "default_sorting_field": "created_at"
}
