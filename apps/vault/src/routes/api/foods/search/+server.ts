import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { typesense } from '$lib/server/typesense';

export interface FoodSearchResult {
	id: string;
	namePl: string | null;
	nameEn: string;
	category: string | null;
	energyKcal: number | null;
	protein: number | null;
	fat: number | null;
	carbs: number | null;
	fiber: number | null;
	nutrients: Record<string, number> | null;
}

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '*';
	const perPage = Number(url.searchParams.get('per_page') ?? '10');
	const sortBy = url.searchParams.get('sort_by') ?? 'created_at:desc';

	try {
		const result = await typesense
			.collections('foods')
			.documents()
			.search({
				q,
				query_by: 'name_en,name_pl',
				per_page: perPage,
				sort_by: sortBy
			});

		const hits: FoodSearchResult[] = (result.hits ?? []).map((hit: any) => {
			const doc = hit.document;
			return {
				id: doc.id as string,
				namePl: doc.name_pl ?? null,
				nameEn: doc.name_en as string,
				category: doc.category ?? null,
				energyKcal: doc.energy_kcal ?? null,
				protein: doc.protein ?? null,
				fat: doc.fat ?? null,
				carbs: doc.carbs ?? null,
				fiber: doc.fiber ?? null,
				nutrients: doc.nutrients ?? null
			};
		});

		return json({ items: hits });
	} catch (error) {
		console.error('Typesense search error:', error);
		return json({ items: [] }, { status: 500 });
	}
};
