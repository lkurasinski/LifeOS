export type SearchResults<K> = {
	items: K[];
	total: number;
	page: number;
	size: number;
};
