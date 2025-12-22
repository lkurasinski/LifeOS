import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { typesense } from '$lib/server/typesense';

export const GET: RequestHandler = async ({ url }) => {
    const q = url.searchParams.get('q') ?? '*';
    const perPage = Number(url.searchParams.get('per_page') ?? '10');

    console.log('asd');
    try {
        const result = await typesense
            .collections('foods')
            .documents()
            .search({
                q,
                query_by: 'name_en',
                per_page: perPage,
                sort_by: 'created_at:desc'
            }); // standard search parameters for Typesense.[web:86][web:94]

        console.log(result);

        const hits = (result.hits ?? []).map((hit: any) => {
            const doc = hit.document;
            return {
                id: doc.id as string,
                name_pl: doc.name_pl as string | null,
                name_en: doc.name_en as string,
                category: doc.category as string | null
            };
        });

        return json({ items: hits });
    } catch (error) {
        console.error('Typesense search error:', error);
        return json({ items: [] }, { status: 500 });
    }
};
