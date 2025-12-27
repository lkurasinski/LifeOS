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

# Recipes collection schema
RECIPES_SCHEMA = {
    "name": "recipes",
    "enable_nested_fields": True,
    "fields": [
        {"name": "id", "type": "string"},
        {"name": "user_id", "type": "string"},
        {"name": "user_name", "type": "string", "optional": True},
        {"name": "name_pl", "type": "string"},
        {"name": "name_en", "type": "string", "optional": True},
        {"name": "description_pl", "type": "string", "optional": True},
        {"name": "description_en", "type": "string", "optional": True},
        {"name": "servings", "type": "int32"},
        {"name": "prep_time_minutes", "type": "int32", "optional": True},
        {"name": "cook_time_minutes", "type": "int32", "optional": True},
        {"name": "difficulty", "type": "string", "facet": True, "optional": True},
        {"name": "is_public", "type": "bool"},
        {"name": "image_url", "type": "string", "optional": True},
        {"name": "awesomeness", "type": "int32", "optional": True, "facet": True},
        {"name": "ingredients", "type": "object[]", "optional": True},
        {"name": "ingredient_names", "type": "string[]", "optional": True},
        {"name": "sub_recipe_slugs", "type": "string[]", "optional": True},
        {"name": "tags", "type": "string[]", "facet": True, "optional": True},
        {"name": "created_at", "type": "int64"},
        {"name": "updated_at", "type": "int64"},
    ],
    "default_sorting_field": "created_at"
}
