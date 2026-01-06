# Food Source Integrations

This directory contains integrations with both internal and external food data sources. Each integration follows the Strategy Pattern and implements a consistent interface for maintainability and extensibility.

## Structure

```
integrations/
├── README.md                    # This file
├── fdc/                         # USDA FoodData Central (External)
│   ├── .gitignore               # Ignore generated files
│   ├── fdc-api-spec.json        # Downloaded OpenAPI spec (gitignored)
│   ├── generated/               # Auto-generated types and SDK (gitignored)
│   │   ├── types.gen.ts         # TypeScript type definitions
│   │   ├── client/              # Generated client code
│   │   └── ...
│   ├── client.ts                # Type-safe API client wrapper
│   ├── mappers.ts               # FDC → Domain model converters
│   ├── fdc-strategy.ts          # FoodSourceStrategy implementation
│   └── fdc-nutrient-mapping.ts  # FDC nutrient ID to INFOODS code mapping
└── typesense/                   # Internal database search (via Typesense)
    ├── typesense.strategy.ts    # FoodSourceStrategy implementation
    ├── typesense.mappers.ts     # Typesense document → Domain model converters
    └── typesense.schema.ts      # Typesense document type definitions
```

## Strategy Pattern

All integrations implement the `FoodSourceStrategy` interface:

```typescript
export interface FoodSourceStrategy {
	readonly name: 'internal' | 'fdc' | 'openfoodfacts';
	search(params: FoodSearchParams): Promise<FoodSearchResults>;
	getById(sourceId: string | number): Promise<Food>;
}
```

This ensures all food sources return consistent domain models (`Food`, `FoodSearchResults`).

## Typesense Strategy (Internal Database)

The Typesense integration provides fast full-text search over foods stored in the internal PostgreSQL database.

### How it Works

1. **Search**: Uses Typesense for fast full-text search
   - Searches indexed documents in the `foods` collection
   - Maps Typesense documents to domain `Food` models

2. **GetById**: Uses Prisma for complete food details
   - Fetches food from PostgreSQL with all nutrients
   - Includes full nutrition data from `FoodNutrition` table

### Usage

The strategy is automatically used when `source=internal` (or no source specified):

```typescript
// Via API
const response = await fetch('/api/foods/search?q=chicken');
// or explicitly
const response = await fetch('/api/foods/search?source=internal&q=chicken');

// Via strategy directly (server-side only)
import { TypesenseStrategy } from '$lib/domain/cookbook/foods/integrations/typesense/typesense.strategy';

const strategy = new TypesenseStrategy();
const results = await strategy.search({ query: 'chicken', pageSize: 25 });
const food = await strategy.getById('food-uuid-123');
```

## USDA FoodData Central (FDC)

External API integration for accessing USDA's comprehensive food database.

### Usage

```typescript
// Via API
const response = await fetch('/api/foods/search?source=fdc&q=chicken breast');
const detail = await fetch('/api/foods/123456?source=fdc');

// Via strategy directly (server-side only)
import { FDCStrategy } from '$lib/domain/cookbook/foods/integrations/fdc/fdc-strategy';

const strategy = new FDCStrategy();
const results = await strategy.search({ query: 'chicken breast', pageSize: 10 });
const food = await strategy.getById(123456);

// Using low-level client (not recommended - use strategy instead)
import { searchFoods, getFoodDetail } from '$lib/domain/cookbook/foods/integrations/fdc/client';
import { mapFDCFoodDetailToFood } from '$lib/domain/cookbook/foods/integrations/fdc/mappers';

const fdcResults = await searchFoods({ query: 'chicken breast', pageSize: 10 });
const fdcFood = await getFoodDetail(123456);
const domainFood = mapFDCFoodDetailToFood(fdcFood);
```

### Regenerating Types

When the FDC API updates:

```bash
# Download latest OpenAPI spec
pnpm openapi:download

# Generate TypeScript types
pnpm openapi:generate

# Or do both at once
pnpm openapi:update
```

## Adding New Integrations

To add a new food data source (e.g., OpenFoodFacts):

### 1. Update Configuration

Edit `apps/vault/openapi.config.json`:

```json
{
	"integrations": [
		{
			"name": "off",
			"displayName": "Open Food Facts",
			"input": {
				"url": "https://world.openfoodfacts.org/api/v2/openapi.json",
				"requiresAuth": false
			},
			"output": {
				"spec": "src/lib/domain/cookbook/foods/integrations/off/off-api-spec.json"
			}
		}
	]
}
```

### 2. Create OpenAPI TS Config

Create `apps/vault/openapi-ts.config.ts` (or update if exists):

```typescript
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	client: 'fetch',
	input: 'src/lib/domain/cookbook/foods/integrations/off/off-api-spec.json',
	output: {
		path: 'src/lib/domain/cookbook/foods/integrations/off/generated',
		format: 'prettier',
		lint: 'eslint'
	}
});
```

### 3. Download and Generate

```bash
pnpm openapi:download
pnpm openapi:generate
```

### 4. Create Client Wrapper

Create `src/lib/domain/cookbook/foods/integrations/off/client.ts`:

```typescript
import { client } from './generated/client.gen';
import { getProduct } from './generated/sdk.gen';

export async function searchProducts(query: string) {
	const { data, error } = await getProduct({
		// ... implementation
	});
	// ...
}
```

### 5. Create Mappers

Create `src/lib/domain/cookbook/foods/integrations/off/mappers.ts`:

```typescript
import type { Food } from '$lib/domain/cookbook/foods';

export function mapOFFProductToFood(offProduct: OFFProduct): Food {
	return {
		name_en: offProduct.product_name,
		name_pl: null,
		category: offProduct.categories,
		scientificName: null,
		brand: offProduct.brands,
		nutrients: mapOFFNutrients(offProduct.nutriments),
		source: {
			provider: 'openfoodfacts',
			externalId: offProduct.code
		},
		userId: null
	};
}
```

### 6. Create Strategy

Create `src/lib/domain/cookbook/foods/integrations/off/off-strategy.ts`:

```typescript
import type { FoodSourceStrategy } from '$lib/services/food-sources';
import type { Food, FoodSearchParams, FoodSearchResults } from '$lib/domain/cookbook/foods';
import { searchProducts, getProduct } from './client';
import { mapOFFProductToFood } from './mappers';

export class OFFStrategy implements FoodSourceStrategy {
	readonly name = 'openfoodfacts' as const;

	async search(params: FoodSearchParams): Promise<FoodSearchResults> {
		const offResults = await searchProducts(params.query);
		return {
			items: offResults.products.map(mapOFFProductToFood),
			total: offResults.count,
			page: offResults.page,
			pageSize: offResults.page_size,
			totalPages: Math.ceil(offResults.count / offResults.page_size)
		};
	}

	async getById(sourceId: string | number): Promise<Food> {
		const offProduct = await getProduct(sourceId.toString());
		return mapOFFProductToFood(offProduct);
	}
}
```

### 7. Register Strategy

Update `src/lib/services/food-sources/index.ts`:

```typescript
import { OFFStrategy } from '$lib/domain/cookbook/foods/integrations/off/off-strategy';

const strategies: Map<string, FoodSourceStrategy> = new Map([
	['internal', new TypesenseStrategy()],
	['fdc', new FDCStrategy()],
	['openfoodfacts', new OFFStrategy()]
]);
```

## Benefits

- **Type Safety**: 100% accurate types from OpenAPI specs
- **Auto-Generated**: No manual type maintenance
- **Easy Updates**: Single command to sync with API changes
- **DDD Pattern**: Clear separation between external APIs and domain
- **Extensible**: Easy to add new data sources

## Files Not in Git

The following files are auto-generated and excluded from git:

- `*/fdc-api-spec.json` - Downloaded OpenAPI specification
- `*/generated/` - Generated TypeScript types and SDK

These are regenerated as needed using `pnpm openapi:update`.
