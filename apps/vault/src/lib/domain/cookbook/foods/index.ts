/**
 * Foods Domain Module
 *
 * Central export point for all food-related domain models, schemas, and utilities.
 * Import from here in your application code.
 */

// Export all schemas and types
export * from './schemas';

// Re-export commonly used schemas for validation
export {
	foodSchema,
	nutrientSchema,
	nutrientValueSchema,
	createFoodCommandSchema,
	updateFoodCommandSchema,
	foodSearchParamsSchema
} from './schemas';

// Type guards and utilities
export { isSavedFood, isFromExternalSource, hasNutrient } from './utils';
