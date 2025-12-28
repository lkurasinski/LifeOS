# External API Integrations

This directory contains integrations with external food data APIs. Each integration follows a consistent DDD-inspired structure for maintainability and extensibility.

## Structure

```
integrations/
├── README.md                    # This file
└── fdc/                         # USDA FoodData Central
    ├── .gitignore               # Ignore generated files
    ├── fdc-api-spec.json        # Downloaded OpenAPI spec (gitignored)
    ├── generated/               # Auto-generated types and SDK (gitignored)
    │   ├── types.gen.ts         # TypeScript type definitions
    │   ├── sdk.gen.ts           # Generated SDK functions
    │   └── ...
    ├── client.ts                # Type-safe API client wrapper
    └── mappers.ts               # FDC ↔ Domain model converters
```

## USDA FoodData Central (FDC)

### Usage

```typescript
import { searchFoods, getFoodDetail } from '$lib/integrations/fdc/client';
import { mapFDCFoodDetail } from '$lib/integrations/fdc/mappers';

// Search for foods
const results = await searchFoods({
	query: 'chicken breast',
	pageSize: 10
});

// Get food details
const food = await getFoodDetail(123456);

// Convert to domain model
const commonFood = mapFDCFoodDetail(food);
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
				"spec": "src/lib/integrations/off/off-api-spec.json"
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
	input: 'src/lib/integrations/off/off-api-spec.json',
	output: {
		path: 'src/lib/integrations/off/generated',
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

Create `src/lib/integrations/off/client.ts`:

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

Create `src/lib/integrations/off/mappers.ts`:

```typescript
export function mapOFFProduct(offProduct: OFFProduct) {
	return {
		sourceId: offProduct.code,
		source: 'openfoodfacts' as const,
		name: offProduct.product_name,
		// ... map other fields
	};
}
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
