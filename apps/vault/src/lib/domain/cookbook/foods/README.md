# Foods Domain Module

This module defines the **canonical data models** (domain models) for all food-related operations in the application.

## Structure

```
foods/
├── README.md                    # This file
├── schemas.ts                   # Zod schemas (single source of truth)
├── index.ts                     # Public API exports
├── utils.ts                     # Type guards and utilities
└── integrations/                # External data source integrations
    ├── README.md                # Integration documentation
    ├── fdc/                     # USDA FoodData Central
    │   ├── client.ts            # Type-safe FDC API client
    │   ├── mappers.ts           # FDC → Domain model converters
    │   ├── fdc-strategy.ts      # Strategy implementation
    │   └── generated/           # Auto-generated types from OpenAPI
    └── typesense/               # Typesense search integration
        ├── typesense.strategy.ts # Internal DB search strategy
        ├── typesense.mappers.ts  # Typesense → Domain model converters
        └── typesense.schema.ts   # Typesense document types
```

## Philosophy

**Single Versatile Entity Pattern:**
- One `Food` type used throughout the entire application
- Components use only the fields they need
- No need for multiple variations (FoodDto, FoodSummary, etc.)
- TypeScript's structural typing handles unused fields gracefully

## Core Principles

1. **Domain-Driven Design**: External APIs are mapped to our domain at the boundary
2. **Type Safety**: All types derived from Zod schemas for runtime validation
3. **Single Source of Truth**: One `Nutrient` definition, one `Food` definition
4. **Versatility**: Same types work for DB entities, API responses, and UI display
5. **Naming Convention**: Locale-related fields use snake_case with language suffix (`name_en`, `name_pl`), other fields use camelCase (`scientificName`, `userId`)

## Usage

### Import

```typescript
import {
	Food,
	Nutrient,
	NutrientValue,
	CreateFoodCommand,
	FoodSearchParams,
	FoodSearchResults,
	foodSchema,
	createFoodCommandSchema,
	isSavedFood,
	hasNutrient
} from '$lib/domain/cookbook/foods';
```

### Working with Food Entity

```typescript
// The Food type is versatile - works for:
// 1. Foods in database (has id, timestamps)
// 2. Foods from external API (before saving)
// 3. Search results
// 4. Forms display

// Example: From database
const savedFood: Food = {
	id: '123',
	name_en: 'Chicken Breast',
	name_pl: 'Pierś z kurczaka',
	category: 'Poultry',
	scientificName: 'Gallus gallus domesticus',
	brand: null,
	nutrients: [
		{
			nutrient: {
				code: 'ENERC_KCAL',
				name_pl: 'Energia',
				name_en: 'Energy',
				unit: 'kcal',
				category: 'energy'
			},
			value: 165
		}
	],
	source: {
		provider: 'fdc',
		externalId: 171477
	},
	userId: null,
	createdAt: new Date(),
	updatedAt: new Date()
};

// Example: From external API (before saving)
const externalFood: Food = {
	// No id, createdAt, updatedAt yet
	name_en: 'Broccoli',
	name_pl: null,
	category: 'Vegetables',
	scientificName: null,
	brand: null,
	nutrients: [/* ... */],
	source: {
		provider: 'fdc',
		externalId: 170379
	},
	userId: null
};
```

### Type Guards

```typescript
import { isSavedFood, isFromExternalSource } from '$lib/domain/foods';

// Check if food is in database
if (isSavedFood(food)) {
	console.log(food.id); // TypeScript knows id exists
}

// Check if from external source
if (isFromExternalSource(food)) {
	console.log(food.source.provider); // TypeScript knows source is not null
}
```

### Validation

```typescript
import { foodSchema, createFoodCommandSchema } from '$lib/domain/foods';

// Validate API response
const result = foodSchema.safeParse(apiResponse);
if (result.success) {
	const food: Food = result.data;
}

// Validate form input
const commandResult = createFoodCommandSchema.safeParse(formData);
if (commandResult.success) {
	await createFood(commandResult.data);
}
```

### Utilities

```typescript
import { hasNutrient, getNutrientValue, getKeyNutrients } from '$lib/domain/foods';

// Check for specific nutrient
if (hasNutrient(food, 'PROT')) {
	const protein = getNutrientValue(food, 'PROT');
	console.log(`Protein: ${protein}g`);
}

// Get key macros for preview
const macros = getKeyNutrients(food); // Energy, Protein, Fat, Carbs
```

## Schema Reference

### Core Schemas

- **`nutrientSchema`** - Nutrient definition (INFOODS code, names, unit)
- **`nutrientValueSchema`** - Nutrient with amount
- **`foodSourceSchema`** - External source info (FDC, OpenFoodFacts)
- **`foodSchema`** - Complete food entity (versatile!)

### Command Schemas (Inputs)

- **`createFoodCommandSchema`** - Create new food (minimal fields)
- **`updateFoodCommandSchema`** - Update existing food
- **`foodSearchParamsSchema`** - Search parameters

### Result Schemas

- **`foodSearchResultsSchema`** - Paginated search results

## Integration with External APIs

External API types (FDC, OpenFoodFacts) should be mapped to domain models **at the API boundary**:

```typescript
// ❌ BAD: Frontend knows about FDC types
import type { FDCFood } from '$lib/integrations/fdc';
const fdcFood: FDCFood = await fetch('/api/fdc/...');

// ✅ GOOD: API returns domain model
import type { Food } from '$lib/domain/foods';
const food: Food = await fetch('/api/foods/search');
```

### Mapping Example

```typescript
// In API route: /api/foods/search/+server.ts
import { getStrategy } from '$lib/services/food-sources';
import type { FoodSearchResults } from '$lib/domain/cookbook/foods';

export const GET: RequestHandler = async ({ url }) => {
	const source = url.searchParams.get('source') || 'internal';
	const strategy = getStrategy(source);

	// Strategy handles mapping to domain models
	const results: FoodSearchResults = await strategy.search({
		query: url.searchParams.get('q') || '*',
		pageSize: 25,
		pageNumber: 1
	});

	return json(results); // Returns { items: Food[], total, page, pageSize, totalPages }
};
```

The Strategy Pattern ensures all external APIs return consistent domain models:

```typescript
// FDC integration example
// File: integrations/fdc/mappers.ts
import type { Food } from '$lib/domain/cookbook/foods';
import type { FDC_FoodDetail } from './generated/types.gen';

export function mapFDCFoodDetailToFood(fdcFood: FDC_FoodDetail): Food {
	return {
		name_en: fdcFood.description,
		name_pl: null,
		category: extractCategory(fdcFood),
		scientificName: fdcFood.scientificName || null,
		brand: fdcFood.brandOwner || null,
		nutrients: mapFDCNutrients(fdcFood.foodNutrients),
		source: {
			provider: 'fdc',
			externalId: fdcFood.fdcId
		},
		userId: null
	};
}
```

## Benefits

✅ **Single Source of Truth** - One Food definition everywhere
✅ **Type Safety** - Zod runtime validation + TypeScript compile-time
✅ **Flexibility** - Same type works for DB, API, UI
✅ **Maintainability** - Change schema once, affects everywhere
✅ **DDD Compliance** - Clear domain boundaries
