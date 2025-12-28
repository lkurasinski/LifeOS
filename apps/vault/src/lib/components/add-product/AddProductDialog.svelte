<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogDescription from '$lib/components/ui/dialog/dialog-description.svelte';
	import Input from '$lib/components/ui/input/Input.svelte';
	import Label from '$lib/components/ui/label/Label.svelte';
	import Button from '$lib/components/ui/button/Button.svelte';
	import SearchResults from './SearchResults.svelte';
	import FoodDetailForm from './FoodDetailForm.svelte';
	import type { Food } from '../../domain/cookbook/foods';

	export let open = false;
	export let initialQuery = '';
	export let source: 'fdc' | 'openfoodfacts' = 'fdc';

	const dispatch = createEventDispatcher<{
		close: void;
		created: { id: string; name_pl: string | null; name_en: string };
	}>();

	type Step = 'search' | 'results' | 'detail';

	let step: Step = 'search';
	let searchQuery = initialQuery;
	let searchResults: Food[] = [];
	let selectedFood: Food | null = null;
	let loading = false;
	let error: string | null = null;

	$: if (open && initialQuery) {
		searchQuery = initialQuery;
	}

	async function handleSearch() {
		if (!searchQuery.trim()) return;

		loading = true;
		error = null;

		try {
			const res = await fetch(
				`/api/foods/search?source=${source}&q=${encodeURIComponent(searchQuery)}&pageSize=25`
			);
			if (!res.ok) throw new Error('Search failed');
			const data = await res.json();
			searchResults = data.items || [];
			step = 'results';
		} catch (e) {
			console.error('Search error:', e);
			error = e instanceof Error ? e.message : 'Failed to search';
		} finally {
			loading = false;
		}
	}

	async function fetchFoodDetail(sourceId: string | number): Promise<Food | null> {
		const res = await fetch(`/api/foods/${sourceId}?source=${source}`);
		if (!res.ok) throw new Error('Failed to load food details');
		return await res.json();
	}

	async function handleSelectFood(event: CustomEvent<{ sourceId: string | number }>) {
		const { sourceId } = event.detail;
		loading = true;
		error = null;

		try {
			const food = await fetchFoodDetail(sourceId);

			if (food) {
				selectedFood = food;
				step = 'detail';
			} else {
				error = 'Food not found';
			}
		} catch (e) {
			console.error('Detail fetch error:', e);
			error = e instanceof Error ? e.message : 'Failed to load details';
		} finally {
			loading = false;
		}
	}

	async function handleSubmitFood(event: CustomEvent<{ foodData: any }>) {
		const { foodData } = event.detail;

		loading = true;
		error = null;

		try {
			const res = await fetch('/api/foods', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(foodData)
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Failed to create food');
			}

			const createdFood = await res.json();
			dispatch('created', {
				id: createdFood.id,
				name_pl: createdFood.namePl,
				name_en: createdFood.nameEn
			});
			handleClose();
		} catch (e) {
			console.error('Food creation error:', e);
			error = e instanceof Error ? e.message : 'Failed to create food';
		} finally {
			loading = false;
		}
	}

	function handleClose() {
		open = false;
		step = 'search';
		searchQuery = '';
		searchResults = [];
		selectedFood = null;
		error = null;
		dispatch('close');
	}

	function handleBack() {
		if (step === 'detail') {
			step = 'results';
			selectedFood = null;
		} else if (step === 'results') {
			step = 'search';
			searchResults = [];
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && step === 'search' && !loading) {
			e.preventDefault();
			handleSearch();
		}
	}
</script>

<Dialog bind:open>
	<DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
		<DialogHeader>
			<DialogTitle>Add Product from External Source</DialogTitle>
			<DialogDescription>
				Search for a food product from external databases and add it to your collection.
			</DialogDescription>
		</DialogHeader>

		{#if error}
			<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
				{error}
			</div>
		{/if}

		{#if step === 'search'}
			<div class="space-y-4">
				<div class="space-y-2">
					<Label>Data Source</Label>
					<div class="px-3 py-2 border rounded-md bg-muted text-sm">
						USDA FoodData Central (OpenFoodFacts coming soon)
					</div>
				</div>

				<div class="space-y-2">
					<Label for="search-query">Search Query</Label>
					<Input
						id="search-query"
						bind:value={searchQuery}
						placeholder="Enter food name..."
						onkeydown={handleKeydown}
					/>
				</div>

				<div class="flex justify-end gap-2">
					<Button variant="outline" onclick={handleClose}>Cancel</Button>
					<Button onclick={handleSearch} disabled={loading || !searchQuery.trim()}>
						{loading ? 'Searching...' : 'Search'}
					</Button>
				</div>
			</div>
		{:else if step === 'results'}
			<SearchResults
				results={searchResults}
				{source}
				{loading}
				onselect={handleSelectFood}
				onback={handleBack}
			/>
		{:else if step === 'detail' && selectedFood}
			<FoodDetailForm
				foodDetail={selectedFood}
				{loading}
				onsubmit={handleSubmitFood}
				onback={handleBack}
			/>
		{/if}
	</DialogContent>
</Dialog>
