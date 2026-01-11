/**
 * Domain schemas for Foods
 *
 * These Zod schemas define the canonical data models used throughout the application.
 * All components, APIs, and database operations work with types derived from these schemas.
 * External API types (FDC, OpenFoodFacts) are mapped to these models at the integration boundary.
 */

import { z } from 'zod';
import { dataSourceProviders, dataSourceSchema } from '$lib';

// ============================================================================
// VALUE OBJECTS
// ============================================================================

export const NutrientsCategories = z.enum([
	'energy',
	'macronutrient',
	'mineral',
	'vitamin',
	'amino_acid',
	'fatty_acid',
	'sterol',
	'sugar',
	'other'
]);

export const nutrientSchema = z.object({
	code: z.string().min(1),
	name_pl: z.string(),
	name_en: z.string(),
	unit: z.string(),
	description: z.string().optional(),
	category: z.string()
});

export type Nutrient = z.infer<typeof nutrientSchema>;

/**
 * NutrientValue - A nutrient with its measured amount
 * Used when displaying or storing nutrient values for foods
 */
export const nutrientValueSchema = z.object({
	/** Reference to the nutrient */
	nutrient: nutrientSchema,
	/** Amount per 100g/100ml */
	value: z.number()
});

export type NutrientValue = z.infer<typeof nutrientValueSchema>;

// ============================================================================
// CORE ENTITY
// ============================================================================
export const foodSchema = z.object({
	id: z.number().optional(), // when entry is not yet created
	name_en: z.string().min(1),
	name_pl: z.string().nullable().optional(),
	category: z.string().nullable().optional(),
	scientificName: z.string().nullable().optional(),
	brand: z.string().nullable().optional(),
	nutrients: z.array(nutrientValueSchema),
	source: dataSourceSchema.nullable().optional(),
	userId: z.string().nullable(),
	createdAt: z.date().optional(), // when entry is not yet created
	updatedAt: z.date().optional() // when entry is not yet created
});

export type Food = z.infer<typeof foodSchema>;

// ============================================================================
// SEARCH & QUERY
// ============================================================================

/**
 * Food Search Parameters
 */
export const foodSearchParamsSchema = z.object({
	query: z.string().min(1),
	category: z.string().optional(),
	source: dataSourceProviders.optional(),
	pageSize: z.number().int().positive().default(25),
	pageNumber: z.number().int().positive().default(1),
	sortBy: z.enum(['name', 'category', 'created_at']).default('name'),
	sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export type FoodSearchParams = z.infer<typeof foodSearchParamsSchema>;

/**
 * Paginated Search Results
 * Contains Food entities (same versatile type)
 */
export const foodSearchResultsSchema = z.object({
	items: z.array(foodSchema),
	total: z.number().int().nonnegative(),
	page: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative()
});

export type FoodSearchResults = z.infer<typeof foodSearchResultsSchema>;

// ============================================================================
// COMMANDS (Simplified inputs for operations)
// ============================================================================

/**
 * Create Food Command
 * Simplified input for creating a new food in the database
 * Intentionally minimal - only what's needed to create a food
 */
export const createFoodCommandSchema = z.object({
	name_en: z.string().min(1, 'English name is required'),
	name_pl: z.string().optional(),
	category: z.string().optional(),
	scientificName: z.string().optional(),
	brand: z.string().optional(),
	nutrients: z.array(
		z.object({
			code: z.string().min(1),
			value: z.number().nonnegative()
		})
	),
	source: dataSourceSchema
});

export type CreateFoodCommand = z.infer<typeof createFoodCommandSchema>;

/**
 * Update Food Command
 * Input for updating an existing food
 */
export const updateFoodCommandSchema = z.object({
	id: z.string(),
	name_en: z.string().min(1).optional(),
	name_pl: z.string().optional(),
	category: z.string().optional(),
	scientificName: z.string().optional(),
	brand: z.string().optional(),
	nutrients: z
		.array(
			z.object({
				code: z.string(),
				value: z.number().nonnegative()
			})
		)
		.optional()
});

export type UpdateFoodCommand = z.infer<typeof updateFoodCommandSchema>;
