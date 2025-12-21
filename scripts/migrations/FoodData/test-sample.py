#!/usr/bin/env python3
"""
Test migration script with sample data.
Creates a small test JSON file and runs migration.
"""

import json
from pathlib import Path

# Sample data - 3 products with various nutrients
SAMPLE_DATA = [
    {
        "fdcId": 999001,
        "description": "Test Product: Apple",
        "foodCategory": {"description": "Fruits"},
        "foodNutrients": [
            {"nutrient": {"name": "Energy", "unitName": "kcal"}, "amount": 52},
            {"nutrient": {"name": "Protein", "unitName": "g"}, "amount": 0.3},
            {"nutrient": {"name": "Carbohydrates", "unitName": "g"}, "amount": 14},
            {"nutrient": {"name": "Fiber", "unitName": "g"}, "amount": 2.4},
            {"nutrient": {"name": "Vitamin C", "unitName": "mg"}, "amount": 4.6}
        ]
    },
    {
        "fdcId": 999002,
        "description": "Test Product: Chicken Breast",
        "foodCategory": {"description": "Poultry Products"},
        "foodNutrients": [
            {"nutrient": {"name": "Energy", "unitName": "kcal"}, "amount": 165},
            {"nutrient": {"name": "Protein", "unitName": "g"}, "amount": 31},
            {"nutrient": {"name": "Fat", "unitName": "g"}, "amount": 3.6},
            {"nutrient": {"name": "Sodium", "unitName": "mg"}, "amount": 74},
            {"nutrient": {"name": "Vitamin B6", "unitName": "mg"}, "amount": 0.5}
        ]
    },
    {
        "fdcId": 999003,
        "description": "Test Product: Brown Rice",
        "foodCategory": {"description": "Cereal Grains"},
        "foodNutrients": [
            {"nutrient": {"name": "Energy", "unitName": "kcal"}, "amount": 111},
            {"nutrient": {"name": "Protein", "unitName": "g"}, "amount": 2.6},
            {"nutrient": {"name": "Carbohydrates", "unitName": "g"}, "amount": 23},
            {"nutrient": {"name": "Fiber", "unitName": "g"}, "amount": 1.8},
            {"nutrient": {"name": "Magnesium", "unitName": "mg"}, "amount": 43}
        ]
    }
]

def main():
    # Create test file
    test_file = Path("../../oss/test-sample.json")
    test_file.parent.mkdir(parents=True, exist_ok=True)

    with test_file.open("w", encoding="utf-8") as f:
        json.dump(SAMPLE_DATA, f, indent=2, ensure_ascii=False)

    print(f"✓ Created test file: {test_file}")
    print(f"  Contains {len(SAMPLE_DATA)} test products")
    print(f"\nTo run migration with this sample:")
    print(f"  1. Backup current oss/fd-survey.json if needed")
    print(f"  2. Run: python import-fooddata.py")
    print(f"     (Make sure INPUT_FILE points to {test_file})")
    print(f"\nOr modify INPUT_FILE in import-fooddata.py to:")
    print(f'  INPUT_FILE = Path("../../oss/test-sample.json")')

if __name__ == "__main__":
    main()
