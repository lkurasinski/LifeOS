#!/usr/bin/env python3
"""
Typesense collection schema definitions.
"""

# Foods collection schema
FOODS_SCHEMA = {
    "name": "foods",
    "enable_nested_fields": True,
    "fields": [
        {"name": "id", "type": "string"},  # Typesense requires document ID as string
        {"name": "name_en", "type": "string"},
        {"name": "name_pl", "type": "string", "optional": True},
        {"name": "scientific_name", "type": "string", "optional": True},
        {"name": "category", "type": "string", "facet": True, "optional": True},
        {"name": "brand", "type": "string", "facet": True, "optional": True},

        # Denormalized common nutrients for fast sorting/filtering (per 100g)
        {"name": "energy_kcal", "type": "float", "optional": True, "facet": True},
        {"name": "protein", "type": "float", "optional": True, "facet": True},
        {"name": "fat", "type": "float", "optional": True, "facet": True},
        {"name": "carbs", "type": "float", "optional": True, "facet": True},
        {"name": "fiber", "type": "float", "optional": True, "facet": True},

        # Complete nutrition data as object with INFOODS codes as keys
        {"name": "nutrients", "type": "object", "optional": True},

        # Source tracking
        {"name": "source_provider", "type": "string", "facet": True, "optional": True},
        {"name": "source_external_id", "type": "string", "optional": True},
        {"name": "source_url", "type": "string", "optional": True},

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
        {"name": "id", "type": "string"},  # Typesense requires document ID as string
        {"name": "slug", "type": "string"},
        {"name": "user_id", "type": "string"},  # Keep as string for consistency with id
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
        {"name": "meal_type", "type": "string[]", "facet": True, "optional": True},
        {"name": "ingredients", "type": "object[]", "optional": True},
        {"name": "ingredient_names", "type": "string[]", "optional": True},
        {"name": "component_slugs", "type": "string[]", "optional": True},
        {"name": "tags", "type": "string[]", "facet": True, "optional": True},

        # Denormalized nutrients for fast filtering/sorting (total for entire recipe)
        {"name": "energy_kcal", "type": "float", "optional": True, "facet": True},
        {"name": "protein", "type": "float", "optional": True, "facet": True},
        {"name": "fat", "type": "float", "optional": True, "facet": True},
        {"name": "carbs", "type": "float", "optional": True, "facet": True},
        {"name": "fiber", "type": "float", "optional": True, "facet": True},

        # Complete nutrition data as object with INFOODS codes as keys (total for entire recipe)
        {"name": "nutrients", "type": "object", "optional": True},

        # Per-serving values for display convenience
        {"name": "energy_kcal_per_serving", "type": "float", "optional": True},
        {"name": "protein_per_serving", "type": "float", "optional": True},
        {"name": "fat_per_serving", "type": "float", "optional": True},
        {"name": "carbs_per_serving", "type": "float", "optional": True},
        {"name": "fiber_per_serving", "type": "float", "optional": True},

        {"name": "created_at", "type": "int64"},
        {"name": "updated_at", "type": "int64"},
    ],
    "default_sorting_field": "created_at"
}
