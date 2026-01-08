import { NUTRIENTS } from '$domains/cookbook/foods/constants/nutrients';
import type { Typesense_FoodDocument } from '$domains/cookbook/foods/server/integrations/typesense/typesense.schema';
import type { Food, NutrientValue } from '$domains/cookbook/foods';

export function mapTypesenseFoodToFood(doc: Typesense_FoodDocument): Food {
	return {
		id: Number(doc.id),
		name_en: doc.name_en,
		name_pl: doc.name_pl ?? null,
		category: doc.category ?? null,
		scientificName: doc.scientific_name,
		brand: doc.brand,
		nutrients: mapTypesenseNutrientsToNutrientsValue(doc.nutrients),
		source: {
			provider: doc.source_provider,
			externalId: doc.id,
			url: doc.source_url
		},
		userId: null, //@TODO
		createdAt: doc.created_at ? new Date(doc.created_at) : undefined,
		updatedAt: doc.updated_at ? new Date(doc.updated_at) : undefined
	};
}

function mapTypesenseNutrientsToNutrientsValue(
	typesenseNutrients: Typesense_FoodDocument['nutrients']
): NutrientValue[] {
	return typesenseNutrients
		? Object.entries(typesenseNutrients)
				.map(([key, value]): NutrientValue | null => {
					const nutrientDef = NUTRIENTS[key];
					// console.log(typesenseNutrients);
					// console.log(nutrientDef);
					if (!nutrientDef) {
						console.log(`not found key: ${key}`);
						return null;
					}

					return {
						nutrient: {
							code: key,
							name_pl: nutrientDef.name_pl,
							name_en: nutrientDef.name_en,
							unit: nutrientDef.unit,
							category: nutrientDef.category
						},
						value: value || 0
					};
				})
				.filter((n: NutrientValue | null): n is NonNullable<typeof n> => n !== null)
		: [];
}
