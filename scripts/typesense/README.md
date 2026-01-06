# Typesense Indexing Scripts

Scripts for indexing PostgreSQL data to Typesense for fast search.

## Prerequisites

1. **Services running**:
   ```bash
   docker compose up -d  # PostgreSQL + Typesense
   ```

2. **Python dependencies**:
   ```bash
   cd scripts/typesense
   python -m pip install -r requirements.txt
   ```

3. **Data in PostgreSQL**:
   - Run database seeding first: `cd scripts && python seed-database.py`

## Quick Start

```bash
cd scripts/typesense

# 1. Health check
python health_check.py

# 2. Full reindex (first time)
python reindex_all.py

# 3. Verify
python health_check.py
```

---

## Scripts

### `health_check.py`

Check health of Typesense and PostgreSQL, show collection statistics.

```bash
python health_check.py
```

---

### `index_foods.py`

Index all foods from PostgreSQL to Typesense.

**What it does:**
- Drops existing `foods` collection
- Creates collection with schema from `schema.py`
- Fetches all foods with denormalized nutrition values
- Indexes in batches (100 docs/batch)

**Denormalized fields:**
Common nutrients are denormalized for fast search:
- `energy_kcal` - Energy in kcal
- `protein` - Protein in g
- `fat` - Total fat in g
- `carbs` - Carbohydrates in g
- `fiber` - Fiber in g

```bash
python index_foods.py
```

**Output:**
```
📦 Setting up collection...
  Dropping existing collection: foods
  Creating collection: foods
  ✓ Collection created: foods

📖 Fetching foods from PostgreSQL...
  ✓ Fetched 7262 foods

🔍 Indexing 7262 foods to Typesense...
✓ Indexing completed!
  Successful: 7262
  Failed: 0
  Success rate: 100.0%
```

---

### `index_nutrition.py`

Index all nutrition entries from PostgreSQL to Typesense.

**What it does:**
- Drops existing `nutrition` collection
- Creates collection with schema
- Fetches all nutrition entries
- Categorizes nutrients (vitamins, minerals, macronutrients, etc.)
- Indexes in batches

```bash
python index_nutrition.py
```

---

### `reindex_all.py`

Reindex all collections (full rebuild).

**What it does:**
1. Runs `index_nutrition.py`
2. Runs `index_foods.py`

Use this for:
- Initial setup
- After schema changes
- Complete rebuild

```bash
python reindex_all.py
```

---

### `update_incremental.py`

Incremental update - only index documents changed recently.

**What it does:**
- Finds foods updated in last N hours (default: 24)
- Updates only those documents in Typesense
- Much faster than full reindex

```bash
# Update foods changed in last 24 hours (default)
python update_incremental.py

# Update foods changed in last 6 hours
python update_incremental.py --hours 6

# Update foods changed in last week
python update_incremental.py --hours 168
```

**When to use:**
- After adding new foods via migration
- Daily/hourly cron job
- After bulk updates

**Output:**
```
🍎 Fetching updated foods (last 24h)...
  Found 15 updated foods
  Indexing 15 foods...
  ✓ Foods: 15 updated, 0 failed

✓ Incremental update completed!
  Total documents updated: 15
```

---

## Configuration

Edit `config.py` to change:

```python
# Database
DATABASE_URL = "postgresql://..."

# Typesense
TYPESENSE_HOST = "localhost"
TYPESENSE_PORT = 8108
TYPESENSE_API_KEY = "xyz123_dev_key"

# Indexing
BATCH_SIZE = 100  # Documents per batch
```

Or use environment variables (`.env` file):

```bash
DATABASE_URL=postgresql://lifeos:password@localhost:5432/lifeos
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=xyz123_dev_key
```

---

## Schema Management

### Viewing Schema

```python
from schema import FOODS_SCHEMA, NUTRITION_SCHEMA

print(FOODS_SCHEMA)
```

### Modifying Schema

1. Edit `schema.py`
2. Run `reindex_all.py` to recreate collections with new schema
3. Test search with new fields

**Example - Add new field:**

```python
# schema.py
FOODS_SCHEMA = {
    "name": "foods",
    "fields": [
        # ... existing fields ...
        {"name": "brand", "type": "string", "optional": True},  # NEW
    ]
}
```

---

## Search Examples

### Using Typesense Client

```python
import typesense

client = typesense.Client({
    'nodes': [{'host': 'localhost', 'port': '8108', 'protocol': 'http'}],
    'api_key': 'xyz123_dev_key',
    'connection_timeout_seconds': 2
})

# Search foods
results = client.collections['foods'].documents.search({
    'q': 'chicken',
    'query_by': 'name_en,name_pl,category',
    'per_page': 10
})

for hit in results['hits']:
    food = hit['document']
    print(f"{food['name_en']} - {food.get('protein', 0)}g protein")
```

### Using cURL

```bash
# Search for "milk"
curl "http://localhost:8108/collections/foods/documents/search?q=milk&query_by=name_en"

# Filter by category
curl "http://localhost:8108/collections/foods/documents/search?q=*&filter_by=category:Dairy"

# High protein foods (>20g)
curl "http://localhost:8108/collections/foods/documents/search?q=*&filter_by=protein:>20"
```

---

## Automation

### Cron Job (Daily Incremental Update)

```bash
# Add to crontab
0 2 * * * cd /path/to/LifeOS/scripts/typesense && python update_incremental.py --hours 24
```

### Post-Seeding Hook

After running database seeding, automatically update index:

```bash
cd scripts
python seed-database.py && cd typesense && python reindex_all.py
```

---

## Troubleshooting

### "Collection not found"

**Problem**: Trying to search before indexing.

**Solution**:
```bash
python reindex_all.py
```

### "Connection refused" (Typesense)

**Problem**: Typesense not running.

**Solution**:
```bash
docker compose up -d
docker compose ps  # Check status
```

### "No documents indexed"

**Problem**: PostgreSQL database is empty.

**Solution**: Run database seeding first:
```bash
cd scripts
python seed-database.py
```

### Slow indexing

**Problem**: Large number of documents, small batch size.

**Solution**: Increase `BATCH_SIZE` in `config.py`:
```python
BATCH_SIZE = 500  # Default: 100
```

---

## Next Steps

After successful indexing:

1. **Test search in API**:
   - Create `/api/foods/search` endpoint in SvelteKit
   - Use Typesense client to query

2. **Build autocomplete**:
   - Use `prefix` search for typeahead
   - Show nutrition info in dropdown

3. **Add filters**:
   - Filter by category (facets)
   - Range filters (protein > 10g)
   - Multi-field search (name + category)

4. **Optimize performance**:
   - Cache popular searches
   - Tune ranking parameters
   - Add more denormalized fields if needed
