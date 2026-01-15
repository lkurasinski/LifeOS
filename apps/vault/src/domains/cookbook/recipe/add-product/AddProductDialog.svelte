<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import * as Dialog from '$lib/components/dialog';
	import * as Select from '$lib/components/select';
	import { useFoodSearch } from '$lib/hooks/useFoodSearch.svelte';
	import { useFoodDetail } from '$lib/hooks/useFoodDetail.svelte';
	import { SEARCH_CONFIG } from '$lib/constants/ui';
	import { API_ROUTES } from '$lib/api/api-routes';
	import { postJson } from '$lib/api/client';
	import type { Food } from '$domains/cookbook/foods';
	import SearchResults from './SearchResults.svelte';
	import FoodDetailForm from './FoodDetailForm.svelte';
	import { Label } from '$lib/components/label';
	import { Input } from '$lib/components/input';
	import { Button } from '$lib/components/button';

	let {
		open = $bindable(false),
		initialQuery = '',
		source = 'fdc',
		onClose,
		onCreated
	}: {
		open?: boolean;
		initialQuery?: string;
		source?: 'fdc' | 'openfoodfacts';
		onClose?: () => void;
		onCreated?: (food: Food) => void;
	} = $props();

	type Step = 'search' | 'results' | 'detail';

	let dataType = $state('Foundation');
	let apiVersion = $state('licious');

	const queryClient = useQueryClient();
	const search = useFoodSearch(() => ({
		source,
		dataType,
		apiVersion,
		pageSize: SEARCH_CONFIG.EXTERNAL_PAGE_SIZE,
		autoSearch: false
	}));

	let step = $state<Step>('search');
	let selectedFood = $state<Food | null>(null);
	let selectedFoodId = $state<number | string | null>(null);

	const foodDetail = useFoodDetail(() => ({
		foodId: selectedFoodId,
		source,
		enabled: !!selectedFoodId
	}));

	$effect(() => {
		if (open && initialQuery) {
			search.setQuery(initialQuery);
		}
	});

	// Watch for food detail loading completion
	$effect(() => {
		if (foodDetail.data && selectedFoodId) {
			selectedFood = foodDetail.data;
			selectedFoodId = null;
			step = 'detail';
		}
	});

	const createFoodMutation = createMutation(() => ({
		mutationFn: (foodData: Food) => postJson<Food>(API_ROUTES.FOODS.CREATE, foodData),
		onSuccess: (createdFood: Food) => {
			queryClient.invalidateQueries({ queryKey: ['foods', 'search', 'internal'] });
			onCreated?.(createdFood);
			handleClose();
		}
	}));

	async function handleSearch() {
		if (search.query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) return;

		const result = await search.refetch();
		if (result.data) {
			step = 'results';
		}
	}

	function handleSelectFood(event: CustomEvent<{ food: Food }>) {
		const { food } = event.detail;

		// Fetch complete food details from external source
		const externalId = food.source?.externalId || food.id;

		if (externalId) {
			selectedFoodId = externalId;
		} else {
			console.error('No external ID or food ID found!');
		}
	}

	function handleSubmitFood(event: CustomEvent<{ foodData: Food }>) {
		const { foodData } = event.detail;
		createFoodMutation.mutate(foodData);
	}

	function handleClose() {
		open = false;
		step = 'search';
		search.clearQuery();
		selectedFood = null;
		onClose?.();
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
		if (e.key === 'Enter' && step === 'search' && !search.isLoading) {
			e.preventDefault();
			handleSearch();
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-3xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Add Product from External Source</Dialog.Title>
			<Dialog.Description>
				Search for a food product from external databases and add it to your collection.
			</Dialog.Description>
		</Dialog.Header>

		{#if search.isError}
			<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
				{search.error?.message || 'An error occurred'}
			</div>
		{/if}

		{#if createFoodMutation.isError}
			<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
				{createFoodMutation.error?.message || 'Failed to create food'}
			</div>
		{/if}

		{#if foodDetail.isError}
			<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
				{foodDetail.error?.message || 'Failed to fetch food details'}
			</div>
		{/if}

		{#if step === 'search'}
			<div class="space-y-4">
				<div class="space-y-2 flex gap-2">
					<div>
						<Label>Data Source</Label>
						<Select.Root type="single" bind:value={source}>
							<Select.Trigger class="w-full">
								{source === 'fdc' ? 'USDA FoodData Central' : 'OpenFoodFacts'}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Label>Data source</Select.Label>
									<Select.Item value="fdc" label="Easy">USDA FoodData Central</Select.Item>
									<Select.Item value="openfoodfacts" label="Medium">OpenFoodFacts</Select.Item>
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</div>

					{#if source === 'fdc'}
						<div>
							<Label>Data type</Label>
							<Select.Root type="single" bind:value={dataType}>
								<Select.Trigger class="w-full">
									{dataType}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.Label>Data type</Select.Label>
										<Select.Item value="Foundation" label="Foundation" />
										<Select.Item value="Survey (FNDDS)" label="Survey (FNDDS)" />
										<Select.Item value="Branded" label="Branded" />
										<Select.Item value="SR Legacy" label="SR Legacy" />
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</div>
					{/if}

					{#if source === 'openfoodfacts'}
						<div>
							<Label>API Version</Label>
							<Select.Root type="single" bind:value={apiVersion}>
								<Select.Trigger class="w-full">
									{apiVersion === 'v1' ? 'API V1' : 'Licious'}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.Label>API version</Select.Label>
										<Select.Item value="licious" label="Licious" />
										<Select.Item value="v1" label="API V1" />
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</div>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="search-query">Search Query</Label>
					<Input
						id="search-query"
						bind:value={search.query}
						placeholder="Enter food name..."
						onkeydown={handleKeydown}
					/>
				</div>

				<div class="flex justify-end gap-2">
					<Button variant="outline" onclick={handleClose}>Cancel</Button>
					<Button
						onclick={handleSearch}
						disabled={search.isLoading ||
							search.query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH}
					>
						{search.isLoading ? 'Searching...' : 'Search'}
					</Button>
				</div>
			</div>
		{:else if step === 'results'}
			{#if foodDetail.isLoading}
				<div class="text-center py-8 text-muted-foreground">Loading food details...</div>
			{:else}
				<SearchResults
					results={search.results}
					{source}
					loading={search.isLoading}
					onselect={handleSelectFood}
					onback={handleBack}
				/>
			{/if}
		{:else if step === 'detail' && selectedFood}
			<FoodDetailForm
				foodDetail={selectedFood}
				loading={createFoodMutation.isPending}
				onsubmit={handleSubmitFood}
				onback={handleBack}
			/>
		{/if}
	</Dialog.Content>
</Dialog.Root>
