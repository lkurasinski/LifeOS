import { NUTRIENTS } from '$lib/constants/nutrients';
import type { Typesense_Food } from '$lib/domain/cookbook/foods/integrations/typesense/typesense.schema';
import type { Food, NutrientValue } from '$lib/domain/cookbook/foods';

export function mapTypesenseFoodToFood(doc: Typesense_Food): Food {
	return {
		id: doc.id,
		name_en: doc.name_en,
		name_pl: doc.name_pl ?? null,
		category: doc.category ?? null,
		scientificName: null,
		brand: null,
		nutrients: mapTypesenseNutrientsToNutrientsValue(doc.nutrients),
		source: {
			provider: 'custom',
			externalId: doc.id
		},
		userId: null, //@TODO
		createdAt: doc.created_at ? new Date(doc.created_at) : undefined,
		updatedAt: doc.updated_at ? new Date(doc.updated_at) : undefined
	};
}

function mapTypesenseNutrientsToNutrientsValue(
	typesenseNutrients: Typesense_Food['nutrients']
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
