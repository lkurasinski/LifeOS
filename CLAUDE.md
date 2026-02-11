# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LifeOS is a personal life management system with a cookbook module (Vault) for managing recipes and nutrition information. The project uses a monorepo structure with pnpm workspaces.

**Tech Stack:**
- Frontend: SvelteKit + Svelte 5, TailwindCSS 4
- Backend: SvelteKit API routes
- Database: PostgreSQL with Prisma ORM
- Search: Typesense for food ingredient search
- Auth: JWT-based authentication with bcrypt
- Validation: Zod
- Internationalization: svelte-i18n (PL primary, EN fallback)
- Data Source: USDA FoodData Central (~7k food items)

## Monorepo Structure

```
/
├── apps/
│   └── vault/          # Main SvelteKit application (Cookbook)
├── packages/
│   └── db/             # Shared Prisma schema and database client
└── scripts/
    ├── migrations/     # Database migration scripts
    └── typesense/      # Typesense indexing scripts
```

## Common Commands

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint all packages
pnpm lint

# Format all packages
pnpm format
```

### Database (Prisma)

```bash
# Generate Prisma client
cd packages/db
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema changes without migration
pnpm db:push

# Open Prisma Studio (database GUI)
pnpm db:studio

# Seed database
pnpm db:seed
```

From root:
```bash
pnpm db:studio
pnpm db:migrate
```

### Docker Services

```bash
# Start PostgreSQL + Typesense
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Check service status
docker compose ps
```

### Typesense Indexing

```bash
cd scripts/typesense

# Install Python dependencies
python -m pip install -r requirements.txt

# Health check (verify services running)
python health_check.py

# Full reindex (first time or after schema changes)
python reindex_all.py

# Incremental update (only recent changes)
python update_incremental.py --hours 24
```

### Vault App (SvelteKit)

```bash
cd apps/vault

# Type checking
pnpm check

# Type checking with watch mode
pnpm check:watch
```

## Architecture

### Database Schema

The database is defined in `packages/db/prisma/schema.prisma` using Prisma. Key models:

- **User**: Authentication and user data (email, passwordHash, locale)
- **Food**: Food ingredients with FDC integration (fdcId, namePl, nameEn, isCustom, userId)
- **Nutrition**: Catalog of nutrients (namePl, nameEn, unit)
- **FoodNutrition**: Nutritional values per 100g (many-to-many between Food and Nutrition)
- **Recipe**: User recipes (title, servings, prepTime, isPublic)
- **RecipeIngredient**: Recipe ingredients with amounts (amountGrams, amountMl, notes)
- **Instruction**: Recipe steps (stepNumber, text)
- **Tag**: Recipe categorization tags
- **RecipeTag**: Many-to-many relationship between Recipe and Tag

**Database naming convention**: All tables and columns use snake_case, table names are plural.

### Authentication System

JWT-based auth implemented in `apps/vault/src/lib/server/auth.ts`:
- Password hashing with bcrypt (10 rounds)
- JWT tokens stored in httpOnly cookies (7 day expiration)
- Auth middleware in `hooks.server.ts` verifies tokens and attaches user to `event.locals`

Auth flow:
1. Register: POST /api/auth/register (email, password, name)
2. Login: POST /api/auth/login → Sets authToken cookie
3. Protected routes check `event.locals.user`
4. Logout: POST /api/auth/logout → Clears cookie

### Food Sources Architecture

The application uses a **Strategy Pattern** to provide unified access to multiple food data sources:

**Food Sources:**
- **Internal** (default): PostgreSQL database via Typesense search + Prisma
- **FDC**: USDA FoodData Central external API
- **OpenFoodFacts**: (Coming soon)

**Key Files:**
- `apps/vault/src/lib/services/food-sources/`: Strategy registry
- `apps/vault/src/lib/domain/cookbook/foods/`: Domain models (Zod schemas)
- `apps/vault/src/lib/domain/cookbook/foods/integrations/`: Source implementations
  - `typesense/`: Internal database search (Typesense + Prisma)
  - `fdc/`: USDA FoodData Central integration
- `apps/vault/src/lib/server/typesense.ts`: Typesense client configuration
- `scripts/typesense/`: Indexing scripts (Python)

**Unified API Endpoints:**
- `GET /api/foods/search?source={internal|fdc}&q=<query>` - Search foods (defaults to internal)
- `GET /api/foods/{id}?source={internal|fdc}` - Get food details (defaults to internal)

**Response Format:**
```typescript
{
  items: Food[],      // Domain model (same structure for all sources)
  total: number,
  page: number,
  pageSize: number,
  totalPages: number
}
```

All external APIs are mapped to domain `Food` models at the integration boundary.

### SvelteKit Route Structure

```
apps/vault/src/routes/
├── (app)/                    # Authenticated app layout
│   ├── +layout.server.ts     # Load user from JWT
│   └── cookbook/             # Recipe management
├── (auth)/                   # Auth layout (no navbar)
│   ├── login/                # Login page
│   └── register/             # Registration page
└── api/                      # API endpoints
    ├── auth/                 # Authentication
    ├── foods/
    │   ├── search/           # Unified search (internal/external)
    │   └── [id]/             # Unified food details
    └── recipes/              # Recipe CRUD
```

**Route groups**: `(app)` requires authentication, `(auth)` is for unauthenticated users.

### Shared Database Package

The `@lifeos/db` package is shared across apps. Import Prisma client:

```typescript
import { prisma } from '@lifeos/db/client';
// or
import { prisma } from '$lib/server/prisma';
```

In vault app, `$lib/server/prisma.ts` re-exports the shared client.

### Logger

Custom Pino logger with request logging:
- `apps/vault/src/lib/server/logger.ts`: Logger instance
- `apps/vault/src/lib/server/logger.handle.ts`: SvelteKit hook for request logging
- Hooks are sequenced: `sequence(loggerHandle, authHandle)`


## Code Conventions

Per `AGENTS.MD`:

- **Modules**: plural, snake_case folders. Special cases: `auth`, `example`
- **JS/TS identifiers**: camelCase
- **Database**: snake_case tables (plural) and columns
- **No one-letter variables**
- **Avoid inline comments**, prefer self-documenting code
- **No `any` types**: Use proper typing with union narrowing
- **Favor functional programming** over classes
- **Code comments in English*

### UI Patterns

- Every dialog: Support `Cmd/Ctrl + Enter` for primary action, `Escape` to cancel
- Default to `CrudForm` for forms, `DataTable` for tables (when available)
- Use shadcn components

### Security and Quality
- Validate all inputs with zod.
- Define create/update/input schemas and reuse from APIs, CLIs, and admin forms.
- Derive TypeScript types from zod via z.infer<typeof schema>.
- Use Runed utilities library

## Data Migration

FoodData import process (USDA FoodData Central):
1. Run FoodData migration: `cd scripts/migrations/FoodData && python import-fooddata.py`
2. Index to Typesense: `cd scripts/typesense && python reindex_all.py`
3. Verify: `python health_check.py`

For incremental updates after adding foods:
```bash
python update_incremental.py --hours 24
```

## Testing Search

### Using Typesense directly:
```bash
# Search foods collection
curl "http://localhost:8108/collections/foods/documents/search?q=chicken&query_by=name_en"

# High protein foods
curl "http://localhost:8108/collections/foods/documents/search?q=*&filter_by=protein:>20"
```

### Using Unified API:
```bash
# Search internal database (default)
curl "http://localhost:5173/api/foods/search?q=tomato&pageSize=10"

# Search internal database (explicit)
curl "http://localhost:5173/api/foods/search?source=internal&q=tomato&pageSize=10"

# Search USDA FoodData Central
curl "http://localhost:5173/api/foods/search?source=fdc&q=chicken%20breast&pageSize=10"

# Get food details from internal DB
curl "http://localhost:5173/api/foods/{uuid}"

# Get food details from FDC
curl "http://localhost:5173/api/foods/171477?source=fdc"
```

**Response format (all sources):**
```json
{
  "items": [
    {
      "id": "uuid",              // Optional (only for saved foods)
      "name_en": "Chicken Breast",
      "name_pl": "Pierś z kurczaka",
      "category": "Poultry",
      "scientificName": null,
      "brand": null,
      "nutrients": [...],
      "source": {
        "provider": "fdc",
        "externalId": 171477
      },
      "userId": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

## Key Implementation Details

### Recipe Creation Flow

1. User selects ingredients via autocomplete (Typesense search)
2. User enters amounts in grams/ml
3. User adds instruction steps
4. System auto-calculates nutrition based on ingredient amounts
5. Recipe saved with all relations (RecipeIngredient, Instruction, RecipeTag)

### Nutrition Calculation

Nutrition values are stored per 100g in FoodNutrition table. Recipe nutrition is calculated by:
1. For each ingredient: `(value_per_100g * amount_grams) / 100`
2. Sum all ingredients for total nutrition
3. Divide by servings for per-serving nutrition

### i18n Strategy

- Primary language: Polish (pl)
- Fallback: English (en)
- Database stores both: `name_pl`, `name_en` / `title_pl`, `title_en`
- User locale stored in User.locale
- Use svelte-i18n for UI translations

## Troubleshooting

**Typesense connection refused:**
```bash
docker compose up -d
docker compose ps
```

**Prisma client out of sync:**
```bash
cd packages/db
pnpm db:generate
```

**No search results:**
```bash
cd scripts/typesense
python health_check.py  # Check collection status
python reindex_all.py   # Reindex if needed
```

**Auth issues:**
- Check JWT_SECRET is set in .env
- Verify authToken cookie is present
- Check `event.locals.user` in server-side code