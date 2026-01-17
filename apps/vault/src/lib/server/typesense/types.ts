/**
 * Typesense document type definitions
 * These match the schemas defined in scripts/typesense/schema.py
 */

export interface FoodDocument {
	id: string; // Typesense requires string IDs
	name_en: string;
	name_pl?: string;
	scientific_name?: string;
	category?: string;
	brand?: string;

	// Denormalized nutrients for fast sorting/filtering (per 100g)
	energy_kcal?: number;
	protein?: number;
	fat?: number;
	carbs?: number;
	fiber?: number;

	// Complete nutrition data with INFOODS codes as keys
	nutrients?: Record<string, number>;

	// Source tracking
	source_provider?: string;
	source_external_id?: string;
	source_url?: string;

	created_at: number; // Unix timestamp
	updated_at: number; // Unix timestamp
}

export interface RecipeDocument {
	id: string; // Typesense requires string IDs
	slug: string;
	user_id: string;
	user_name?: string;
	name_pl: string;
	name_en?: string;
	description_pl?: string;
	description_en?: string;
	servings: number;
	prep_time_minutes?: number;
	cook_time_minutes?: number;
	difficulty?: string;
	is_public: boolean;
	image_url?: string;
	awesomeness?: number;
	meal_type?: string[];

	// Ingredients with food details
	ingredients?: Array<{
		food_id: number;
		food_name_pl?: string;
		food_name_en: string;
		amount?: number;
		unit: string;
		notes?: string;
	}>;

	// Searchable ingredient names
	ingredient_names?: string[];

	// Component recipe slugs
	component_slugs?: string[];

	// Tags
	tags?: string[];

	created_at: number; // Unix timestamp
	updated_at: number; // Unix timestamp
}
