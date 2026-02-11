import type { Food, FoodNutrientAmount } from '$backend/cookbook/food/domain/food.types';
import type { Typesense_FoodDocument } from '$backend/cookbook/food/infrastructure/typesense/FoodCatalog/FoodCatalog.typesense.schema';
import { NUTRIENTS } from '$backend/cookbook/common/nutrient/nutrient';
import { SKIPPED_NUTRIENTS, sortNutrientsByAmount } from '$backend/cookbook/food/domain/food';

export function mapTypesenseFoodToFood(doc: Typesense_FoodDocument): Food {
	return {
		id: Number(doc.id),
		name: {
			pl: doc.name_pl,
			en: doc.name_en
		},
		category: doc.category,
		scientificName: doc.scientific_name,
		brand: doc.brand,
		nutrients: mapTypesenseNutrientsToDomain(doc.nutrients),
		source: {
			provider: doc.source_provider,
			externalId: doc.id,
			url: doc.source_url
		},
		createdAt: new Date(doc.created_at),
		updatedAt: new Date(doc.updated_at)
	};
}

function mapTypesenseNutrientsToDomain(
	typesenseNutrients: Typesense_FoodDocument['nutrients']
): FoodNutrientAmount[] {
	return typesenseNutrients
		? Object.entries(typesenseNutrients)
				.map(([key, value]): FoodNutrientAmount | undefined => {
					const nutrientDef = NUTRIENTS[key];
					if (!nutrientDef) {
						console.log(`not found key: ${key}`);
						return undefined;
					}

					if (SKIPPED_NUTRIENTS.includes(nutrientDef.code)) {
						return undefined;
					}

					return {
						nutrient: {
							code: key,
							name: {
								pl: nutrientDef.name_pl,
								en: nutrientDef.name_en
							},
							unit: nutrientDef.unit,
							categoryId: nutrientDef.category
						},
						amount: value < 0 ? 0 : value || 0 //in some products amount of nutrient can be negative
					};
				})
				.filter((el) => typeof el !== 'undefined')
				.sort(sortNutrientsByAmount)
		: [];
}
