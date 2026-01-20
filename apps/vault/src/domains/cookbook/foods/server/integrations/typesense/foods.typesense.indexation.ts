/**
 * Typesense indexing utilities for Foods
 */

import { prisma } from '$lib/server/prisma';
import { typesense } from '$lib/server/typesense';
import { logger } from '$lib/server/logger/logger';
import type { Typesense_FoodDocument } from '$domains/cookbook/foods/server/integrations/typesense/foods.typesense.schema';
import type { DataSourceProviders } from '$lib/schemas/dataSource.schema';

const COLLECTION_NAME = 'foods';

/**
 * Map common nutrient INFOODS codes to document fields
 */
const NUTRIENT_MAPPING = {
	ENERC_KCAL: 'energy_kcal',
	PROT: 'protein',
	FAT: 'fat',
	CHOAVL: 'carbs',
	FIBTG: 'fiber'
} as const satisfies Record<string, keyof Typesense_FoodDocument>;

/**
 * Fetch food from database with all nutrients
 */
async function fetchFoodWithNutrients(foodId: number) {
	return await prisma.food.findUnique({
		where: { id: foodId },
		include: {
			nutritions: {
				include: {
					nutrition: true
				}
			}
		}
	});
}

/**
 * Transform Food model to Typesense document
 */
function transformFoodToDocument(
	food: NonNullable<Awaited<ReturnType<typeof fetchFoodWithNutrients>>>
): Typesense_FoodDocument {
	// Build nutrients object with INFOODS codes as keys
	const nutrients: Record<string, number> = {};
	const denormalized: Partial<Typesense_FoodDocument> = {};

	for (const fn of food.nutritions) {
		const code = fn.nutrition.id;
		nutrients[code] = fn.amount;

		// Denormalize common nutrients for fast filtering
		if (code in NUTRIENT_MAPPING) {
			const field = NUTRIENT_MAPPING[code as keyof typeof NUTRIENT_MAPPING];
			denormalized[field] = fn.amount;
		}
	}

	const doc: Typesense_FoodDocument = {
		id: String(food.id),
		name_en: food.nameEn,
		created_at: Math.floor(food.createdAt.getTime() / 1000),
		updated_at: Math.floor(food.updatedAt.getTime() / 1000),
		source_provider: matchSourceProvider(food?.sourceProvider),
		...denormalized
	};

	// Optional fields
	if (food.namePl) doc.name_pl = food.namePl;
	if (food.scientificName) doc.scientific_name = food.scientificName;
	if (food.category) doc.category = food.category;
	if (food.brand) doc.brand = food.brand;
	if (food.sourceExternalId) doc.source_external_id = food.sourceExternalId;
	if (food.sourceUrl) doc.source_url = food.sourceUrl;
	if (Object.keys(nutrients).length > 0) doc.nutrients = nutrients;

	return doc;
}

const matchSourceProvider = (source: string | undefined | null): DataSourceProviders => {
	switch (source) {
		case 'fdc':
		case 'openfoodfacts':
		case 'home-baked':
			return source;
		default:
			return 'home-baked';
	}
};

/**
 * Index a single food to Typesense
 * Returns true on success, false on failure
 */
export async function indexFood(foodId: number): Promise<boolean> {
	try {
		// Fetch food with nutrients
		const food = await fetchFoodWithNutrients(foodId);

		if (!food) {
			logger.warn({ foodId }, 'Food not found for indexing');
			return false;
		}

		// Transform to Typesense document
		const document = transformFoodToDocument(food);

		// Upsert to Typesense
		await typesense.collections(COLLECTION_NAME).documents().upsert(document);

		// Update indexed_at timestamp (if field exists)
		try {
			await prisma.food.update({
				where: { id: foodId },
				data: { indexedAt: new Date() } as any
			});
		} catch (err) {
			// Ignore if indexedAt field doesn't exist yet (migration pending)
			logger.warn({ foodId }, 'Could not update indexedAt - migration may be pending');
		}

		logger.info({ foodId, docId: document.id }, 'Food indexed successfully');
		return true;
	} catch (error) {
		logger.error({ foodId, error }, 'Failed to index food to Typesense');
		return false;
	}
}

/**
 * Index multiple foods in batch
 * Returns count of successfully indexed foods
 */
export async function indexFoodsBatch(foodIds: number[]): Promise<number> {
	let successCount = 0;

	for (const foodId of foodIds) {
		const success = await indexFood(foodId);
		if (success) successCount++;
	}

	return successCount;
}

/**
 * Find foods that need reindexing (updated_at > indexed_at or indexed_at is null)
 */
export async function findFoodsNeedingReindex(): Promise<number[]> {
	try {
		const foods = await prisma.food.findMany({
			where: {
				OR: [
					{ indexedAt: null } as any,
					{
						updatedAt: {
							gt: (prisma.food.fields as any).indexedAt
						}
					}
				]
			},
			select: { id: true },
			orderBy: { updatedAt: 'desc' },
			take: 100 // Limit to avoid overwhelming
		});

		return foods.map((f) => f.id);
	} catch (err) {
		// If indexedAt field doesn't exist yet, return empty array
		logger.warn('Could not find foods needing reindex - migration may be pending');
		return [];
	}
}
