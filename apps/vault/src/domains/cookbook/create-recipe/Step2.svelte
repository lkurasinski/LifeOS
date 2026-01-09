<script lang="ts">
	import * as Command from '../../../lib/components/command';
	import { Label } from '../../../lib/components/label';
	import { Button } from '../../../lib/components/button';
	import { createQuery } from '@tanstack/svelte-query';
	import { buildSearchUrl, API_ROUTES } from '$lib/api/api-routes';
	import { fetchJson } from '$lib/api/client';
	import type { RecipeIngredient } from '$domains/cookbook/recipe/recipe.schema';
	import IngredientsList from './IngredientsList.svelte';
	import AddProductDialog from '$lib/components/add-product/AddProductDialog.svelte';

	import type { Food } from '$domains/cookbook/foods';

	let {
		selectedFood = $bindable<Food | null>(null),
		ingredients = [],
		onSelect
	}: {
		selectedFood?: Food | null;
		ingredients?: RecipeIngredient[];
		onSelect?: () => void;
	} = $props();

	let query = $state('');
	let minChars = 2;
	let perPage = 10;
	let showAddProductDialog = $state(false);

	const searchQuery = createQuery(() => ({
		queryKey: ['foods', 'search', query, perPage] as const,
		queryFn: () =>
			fetchJson<{ items: Food[] }>(
				buildSearchUrl(API_ROUTES.FOODS.SEARCH, {
					q: query,
					pageSize: perPage
				})
			),
		enabled: query.length >= minChars,
		placeholderData: (previousData: { items: Food[] } | undefined) => previousData
	}));

	function selectOption(option: Food) {
		selectedFood = option;
		query = option.name_pl ?? option.name_en;
		onSelect?.();
	}

	function handleProductCreated(event: CustomEvent<Food>) {
		selectOption(event.detail);
		showAddProductDialog = false;
	}
</script>

<div class="space-y-2">
	<Label>Search for ingredident</Label>
	<Command.Root shouldFilter={false} class="rounded-lg border">
		<Command.Input bind:value={query} placeholder="Type to search ingredients..." />
		<Command.List>
			{#if searchQuery.isPending}
				<!--				<Command.Loading>Searching...</Command.Loading>-->
			{:else if query.length >= minChars && (searchQuery.data?.items ?? []).length === 0}
				<div class="py-6 px-4 text-center space-y-3">
					<Command.Empty>No results found for "{query}"</Command.Empty>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (showAddProductDialog = true)}
					>
						+ Add Product from External Source
					</Button>
				</div>
			{/if}
			{#if (searchQuery.data?.items ?? []).length > 0}
				<Command.Group heading="Select ingredient">
					{#each searchQuery.data?.items ?? [] as option}
						<Command.Item
							value={option.id?.toString() || option.name_en}
							onSelect={() => selectOption(option)}
						>
							<div class="flex flex-col">
								<span class="font-medium">{option.name_pl ?? option.name_en}</span>
								<div class="text-xs text-muted-foreground">
									{#if option.name_pl || option.name_en}
										{option.name_en}
									{/if}
									{#if option.category}
										· {option.category}
									{/if}
								</div>
							</div>
						</Command.Item>
					{/each}
				</Command.Group>
			{/if}
		</Command.List>
	</Command.Root>

	{#if selectedFood}
		<p class="text-sm text-muted-foreground mt-2">
			Selected: {selectedFood.name_pl ?? selectedFood.name_en}
		</p>
	{/if}

	<!-- Display already added ingredients -->
	{#if ingredients.length > 0}
		<div class="mt-4">
			<IngredientsList {ingredients} showTitle={true} />
		</div>
	{/if}
</div>

<AddProductDialog
	bind:open={showAddProductDialog}
	on:created={handleProductCreated}
	initialQuery={query}
/>
