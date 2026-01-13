# Food Sources Service

This service provides a **unified interface** to search and retrieve food data from multiple sources using the **Strategy Pattern**.

## Architecture

```
┌─────────────────────────────────────────────┐
│         Unified Food API                    │
│  GET /api/foods/search?source=X&q=...       │
│  GET /api/foods/{id}?source=X               │
└────────────┬────────────────────────────────┘
             │
      ┌──────┴──────┐
      │  Strategy   │  <-- This Service
      │  Registry   │
      └──────┬──────┘
             │
   ┌─────────┼─────────┬──────────────┐
   │         │         │              │
┌──▼──┐  ┌──▼──┐  ┌───▼──────┐  ┌───▼──────┐
│Inter│  │ FDC │  │OpenFood  │  │ Future   │
│nal  │  │     │  │Facts     │  │ Sources  │
└─────┘  └─────┘  └──────────┘  └──────────┘
   │         │          │             │
Prisma   USDA     OpenFood...    ...
Typesen  FDC API   Facts API
```

## Strategy Pattern

All food sources implement the `FoodSourceStrategy` interface:

```typescript
export interface FoodSourceStrategy {
	readonly name: 'internal' | 'fdc' | 'openfoodfacts';
	search(params: FoodSearchParams): Promise<FoodSearchResults>;
	getById(sourceId: string | number): Promise<Food>;
}
```

## Available Strategies

### 1. Internal (TypesenseStrategy)
- **Name**: `'internal'`
- **Default**: Used when no source is specified
- **Implementation**: `$domains/cookbook/foods/integrations/typesense/foods.typesense.strategy.ts`
- **Data Source**: PostgreSQL database via Typesense search + Prisma
- **Use Case**: Search foods already in the database

### 2. FDC (FDCStrategy)
- **Name**: `'fdc'`
- **Implementation**: `$domains/cookbook/foods/integrations/fdc/fdc-strategy.ts`
- **Data Source**: USDA FoodData Central external API
- **Use Case**: Import new foods from USDA database

### 3. OpenFoodFacts (Coming Soon)
- **Name**: `'openfoodfacts'`
- **Implementation**: TBD
- **Data Source**: Open Food Facts external API
- **Use Case**: Import branded/international foods

## Usage

### Getting a Strategy

```typescript
import { getStrategy } from '$lib/services/food-sources';

const strategy = getStrategy('fdc');
```

### Search Foods

```typescript
const results = await strategy.search({
	query: 'chicken breast',
	pageSize: 25,
	pageNumber: 1
});

// Returns:
// {
//   items: Food[],      // Domain models
//   total: number,
//   page: number,
//   pageSize: number,
//   totalPages: number
// }
```

### Get Food by ID

```typescript
const food = await strategy.getById('171477');  // FDC ID
// or
const food = await strategy.getById('uuid');    // Internal DB UUID

// Returns: Food (domain model)
```

## Adding New Strategies

To add a new food source:

1. **Create integration** in `$domains/cookbook/foods/integrations/{source}/`
   - `{source}-strategy.ts` - Implement `FoodSourceStrategy`
   - `client.ts` - API client
   - `fdc.mappers.ts` - Map external types to `Food` domain model

2. **Register strategy** in `index.ts`:
   ```typescript
   import { NewStrategy } from '$domains/cookbook/foods/integrations/new/new-strategy';

   const strategies: Map<string, FoodSourceStrategy> = new Map([
     ['internal', new TypesenseStrategy()],
     ['fdc', new FDCStrategy()],
     ['new', new NewStrategy()]  // Add here
   ]);
   ```

3. **Update types** in `types.ts`:
   ```typescript
   readonly name: 'internal' | 'fdc' | 'openfoodfacts' | 'new';
   ```

## Key Benefits

✅ **Unified Interface** - All sources return the same domain models
✅ **Extensible** - Easy to add new food data sources
✅ **Type Safe** - Full TypeScript support
✅ **Testable** - Each strategy can be tested independently
✅ **Single Responsibility** - Each strategy encapsulates one source
✅ **Open/Closed Principle** - Add new sources without modifying existing code

## Related Documentation

- [Food Domain Models](../../domain/cookbook/foods/README.md) - Domain schema and types
- [Food Integrations](../../domain/cookbook/foods/integrations/README.md) - Strategy implementations
- [CLAUDE.md](../../../../../CLAUDE.md) - Project architecture overview
