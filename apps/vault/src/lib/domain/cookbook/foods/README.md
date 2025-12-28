# Foods Domain Module

This module defines the **canonical data models** (domain models) for all food-related operations in the application.

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

## Usage

### Import

```typescript
import {
	Food,
	Nutrient,
	NutrientValue,
	CreateFoodCommand,
	foodSchema,
	createFoodCommandSchema,
	isSavedFood,
	hasNutrient
} from '$lib/domain/foods';
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
	nameEn: 'Chicken Breast',
	namePl: 'Pierś z kurczaka',
	category: 'Poultry',
	scientificName: 'Gallus gallus domesticus',
	brand: null,
	nutrients: [
		{
			nutrient: {
				code: 'ENERC_KCAL',
				namePl: 'Energia',
				nameEn: 'Energy',
				unit: 'kcal'
			},
			value: 165
		}
	],
	source: {
		provider: 'fdc',
		externalId: 171477
	},
	isCustom: false,
	userId: null,
	createdAt: new Date(),
	updatedAt: new Date()
};

// Example: From external API (before saving)
const externalFood: Food = {
	// No id, createdAt, updatedAt yet
	nameEn: 'Broccoli',
	namePl: null,
	category: 'Vegetables',
	// ... rest of fields
	nutrients: [/* ... */],
	source: {
		provider: 'fdc',
		externalId: 170379
	},
	isCustom: false,
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
import { searchFDC } from '$lib/integrations/fdc/client';
import { mapFDCToFood } from '$lib/integrations/fdc/mappers';
import type { Food } from '$lib/domain/foods';

export const GET: RequestHandler = async ({ url }) => {
	const fdcResults = await searchFDC({ query: url.searchParams.get('q') });

	// Map FDC types to domain Food type
	const foods: Food[] = fdcResults.map(mapFDCToFood);

	return json({ items: foods });
};
```

## Benefits

✅ **Single Source of Truth** - One Food definition everywhere
✅ **Type Safety** - Zod runtime validation + TypeScript compile-time
✅ **Flexibility** - Same type works for DB, API, UI
✅ **Maintainability** - Change schema once, affects everywhere
✅ **DDD Compliance** - Clear domain boundaries
