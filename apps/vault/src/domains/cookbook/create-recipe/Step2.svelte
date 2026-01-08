<script lang="ts">
	import * as Command from '../../../lib/components/command';
	import { Label } from '../../../lib/components/label';
	import { Button } from '../../../lib/components/button';
	import { resource } from 'runed';
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

	const searchResource = resource(
		() => query,
		async (q) => {
			if (q.length < minChars) {
				return { items: [] };
			}
			try {
				// Uses unified API - defaults to internal source
				const response = await fetch(
					`/api/foods/search?q=${encodeURIComponent(q)}&pageSize=${perPage}`
				);
				const data = await response.json();
				// Return full Food models
				return { items: data.items || [] };
			} catch (error) {
				console.error(error);
				return { items: [] };
			}
		},
		{
			debounce: 300
		}
	);

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
	<Label>Search for ingredient</Label>
	<Command.Root shouldFilter={false} class="rounded-lg border">
		<Command.Input bind:value={query} placeholder="Type to search ingredients..." />
		<Command.List>
			{#if searchResource.loading}
				<!--				<Command.Loading>Searching...</Command.Loading>-->
			{:else if query.length >= minChars && (searchResource.current?.items ?? []).length === 0}
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
			{#if (searchResource.current?.items ?? []).length > 0}
				<Command.Group heading="Select ingredient">
					{#each searchResource.current?.items ?? [] as option}
						<Command.Item value={option.i} onSelect={() => selectOption(option)}>
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
	initialQuery={query}
	on:created={handleProductCreated}
/>
