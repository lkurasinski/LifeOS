# Typesense Indexing - Hybrid Approach

This directory contains the **hybrid indexing system** for Typesense, combining immediate indexing with background reconciliation.

## Architecture

### Immediate Indexing
When a food or recipe is created/updated, it's immediately indexed to Typesense:
- ✅ **Non-blocking**: Failures don't break the request
- ✅ **Instant search updates**: Users see new items immediately
- ✅ **Graceful degradation**: Logs errors but continues

### Background Reconciliation
A cron job runs every 5 minutes to catch failed indexes:
- ✅ **Self-healing**: Automatically fixes missed updates
- ✅ **Tracks sync status**: Uses `indexed_at` column
- ✅ **Batch processing**: Efficient bulk reindexing

## Database Schema

Added `indexed_at` column to track sync status:

```prisma
model Food {
  // ...
  indexedAt DateTime? @map("indexed_at")
}

model Recipe {
  // ...
  indexedAt DateTime? @map("indexed_at")
}
```

## Usage

### Immediate Indexing (Already Integrated)

Food creation automatically triggers indexing:
```typescript
// apps/vault/src/routes/api/foods/+server.ts
const food = await prisma.food.create({ ... });

indexFood(food.id).catch(err => {
  console.error('Failed to index', err);
});
```

Recipe creation automatically triggers indexing:
```typescript
// apps/vault/src/routes/api/recipes/+server.ts
const recipe = await createRecipe(input, userId);

indexRecipe(recipe.id).catch(err => {
  console.error('Failed to index', err);
});
```

### Background Reconciliation

#### Manual Trigger
```bash
curl -X POST http://localhost:5173/api/admin/reindex
```

#### Setup Cron Job

**Option 1: Local Development (node-cron)**
Create `apps/vault/src/lib/server/cron.ts`:
```typescript
import cron from 'node-cron';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  await fetch('http://localhost:5173/api/admin/reindex', {
    method: 'POST'
  });
});
```

**Option 2: Production (External Cron Service)**

Use services like:
- **Vercel Cron**: Add to `vercel.json`
- **Railway Cron**: Add to dashboard
- **GitHub Actions**: Schedule workflow
- **Cron-job.org**: Free external service

Example GitHub Actions (`.github/workflows/reindex.yml`):
```yaml
name: Typesense Reconciliation
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
jobs:
  reindex:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger reindex
        run: |
          curl -X POST https://your-app.com/api/admin/reindex \
            -H "Authorization: Bearer ${{ secrets.ADMIN_API_KEY }}"
```

## Security

### Add API Key Protection

1. Set environment variable:
```env
ADMIN_API_KEY=your-secret-key-here
```

2. Call with authorization:
```bash
curl -X POST http://localhost:5173/api/admin/reindex \
  -H "Authorization: Bearer your-secret-key-here"
```

## Monitoring

### Check Sync Status

Find items needing reindex:
```typescript
import { findFoodsNeedingReindex, findRecipesNeedingReindex } from '$lib/server/typesense';

const foodIds = await findFoodsNeedingReindex();
const recipeIds = await findRecipesNeedingReindex();

console.log(`${foodIds.length} foods need reindex`);
console.log(`${recipeIds.length} recipes need reindex`);
```

### View Logs

Indexing operations are logged with context:
```typescript
logger.info({ foodId, docId }, 'Food indexed successfully');
logger.error({ recipeId, error }, 'Failed to index recipe');
```

## API Reference

### `indexFood(foodId: number): Promise<boolean>`
Index a single food to Typesense.

### `indexRecipe(recipeId: number): Promise<boolean>`
Index a single recipe to Typesense.

### `indexFoodsBatch(foodIds: number[]): Promise<number>`
Index multiple foods. Returns count of successful indexes.

### `indexRecipesBatch(recipeIds: number[]): Promise<number>`
Index multiple recipes. Returns count of successful indexes.

### `findFoodsNeedingReindex(): Promise<number[]>`
Find foods where `updated_at > indexed_at` or `indexed_at IS NULL`.

### `findRecipesNeedingReindex(): Promise<number[]>`
Find recipes where `updated_at > indexed_at` or `indexed_at IS NULL`.

### `removeRecipeFromIndex(recipeId: number): Promise<boolean>`
Remove recipe from Typesense (for deleted/private recipes).

## Migration

After pulling these changes, run:

```bash
# Generate Prisma client
pnpm db:generate

# Create migration
pnpm db:migrate

# Manually reindex all existing data
curl -X POST http://localhost:5173/api/admin/reindex
```

## Troubleshooting

### "Foods/Recipes not appearing in search"

1. Check if indexing succeeded:
```sql
SELECT id, name_pl, updated_at, indexed_at
FROM foods
WHERE indexed_at IS NULL OR updated_at > indexed_at;
```

2. Manually trigger reindex:
```bash
curl -X POST http://localhost:5173/api/admin/reindex
```

### "Typesense connection errors"

1. Verify Typesense is running:
```bash
docker compose ps
```

2. Check connection:
```bash
curl http://localhost:8108/health
```

3. Verify environment variables:
```env
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=your-key
```

## Future Improvements

- [ ] Add queue system (Bull/BullMQ) for high-volume scenarios
- [ ] Add retry logic with exponential backoff
- [ ] Track indexing failures in database
- [ ] Add metrics/monitoring dashboard
- [ ] Implement update/delete hooks (currently only create)
