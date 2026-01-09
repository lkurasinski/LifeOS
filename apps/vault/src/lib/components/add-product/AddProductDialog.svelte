<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import DialogContent from '$lib/components/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/dialog/dialog-title.svelte';
	import DialogDescription from '$lib/components/dialog/dialog-description.svelte';
	import Input from '$lib/components/input/Input.svelte';
	import Label from '$lib/components/label/Label.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import SearchResults from './SearchResults.svelte';
	import FoodDetailForm from './FoodDetailForm.svelte';
	import { buildSearchUrl, API_ROUTES } from '$lib/api/api-routes';
	import { fetchJson, postJson } from '$lib/api/client';
	import type { Food } from '$domains/cookbook/foods';

	let {
		open = $bindable(false),
		initialQuery = '',
		source = 'fdc'
	}: {
		open?: boolean;
		initialQuery?: string;
		source?: 'fdc' | 'openfoodfacts';
	} = $props();

	const dispatch = createEventDispatcher<{
		close: void;
		created: Food;
	}>();

	type Step = 'search' | 'results' | 'detail';

	const queryClient = useQueryClient();

	let step = $state<Step>('search');
	let searchQuery = $state('');
	let selectedFood = $state<Food | null>(null);

	$effect(() => {
		if (open && initialQuery) {
			searchQuery = initialQuery;
		}
	});

	const externalSearchQuery = createQuery(() => ({
		queryKey: ['foods', 'external', source, searchQuery] as const,
		queryFn: () =>
			fetchJson<{ items: Food[] }>(
				buildSearchUrl(API_ROUTES.FOODS.SEARCH, {
					source,
					q: searchQuery,
					pageSize: 25
				})
			),
		enabled: false // Manual trigger only
	}));

	const createFoodMutation = createMutation(() => ({
		mutationFn: (foodData: Food) => postJson<Food>(API_ROUTES.FOODS.CREATE, foodData),
		onSuccess: (createdFood: Food) => {
			// Invalidate food search queries to refetch with new data
			queryClient.invalidateQueries({ queryKey: ['foods', 'search'] });
			dispatch('created', createdFood);
			handleClose();
		}
	}));

	async function handleSearch() {
		if (!searchQuery.trim()) return;

		const result = await externalSearchQuery.refetch();
		if (result.data) {
			step = 'results';
		}
	}

	async function handleSelectFood(event: CustomEvent<{ sourceId: string | number }>) {
		const { sourceId } = event.detail;

		try {
			const food = await fetchJson<Food>(API_ROUTES.FOODS.DETAILS(sourceId, source));
			selectedFood = food;
			step = 'detail';
		} catch (e) {
			console.error('Detail fetch error:', e);
			// Error will be shown through UI
		}
	}

	function handleSubmitFood(event: CustomEvent<{ foodData: Food }>) {
		const { foodData } = event.detail;
		createFoodMutation.mutate(foodData);
	}

	function handleClose() {
		open = false;
		step = 'search';
		searchQuery = '';
		selectedFood = null;
		dispatch('close');
	}

	function handleBack() {
		if (step === 'detail') {
			step = 'results';
			selectedFood = null;
		} else if (step === 'results') {
			step = 'search';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && step === 'search' && !externalSearchQuery.isFetching) {
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

		{#if externalSearchQuery.isError}
			<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
				{externalSearchQuery.error?.message || 'An error occurred'}
			</div>
		{/if}

		{#if createFoodMutation.isError}
			<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
				{createFoodMutation.error?.message || 'Failed to create food'}
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
					<Button
						onclick={handleSearch}
						disabled={externalSearchQuery.isFetching || !searchQuery.trim()}
					>
						{externalSearchQuery.isFetching ? 'Searching...' : 'Search'}
					</Button>
				</div>
			</div>
		{:else if step === 'results'}
			<SearchResults
				results={externalSearchQuery.data?.items || []}
				{source}
				loading={externalSearchQuery.isFetching}
				onselect={handleSelectFood}
				onback={handleBack}
			/>
		{:else if step === 'detail' && selectedFood}
			<FoodDetailForm
				foodDetail={selectedFood}
				loading={createFoodMutation.isPending}
				onsubmit={handleSubmitFood}
				onback={handleBack}
			/>
		{/if}
	</DialogContent>
</Dialog>
