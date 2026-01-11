<script lang="ts">
	import * as Command from '$lib/components/command';
	import { Label } from '$lib/components/label';
	import { Button } from '$lib/components/button';
	import { createQuery } from '@tanstack/svelte-query';
	import { buildSearchUrl, API_ROUTES } from '$lib/api/api-routes';
	import { fetchJson } from '$lib/api/client';
	import type { RecipeIngredient } from '$domains/cookbook/recipe/recipe.schema';
	import IngredientsList from './IngredientsList.svelte';
	import AddProductDialog from '../add-product/AddProductDialog.svelte';
	import type { Food } from '$domains/cookbook/foods';

	let {
		ingredients = $bindable<RecipeIngredient[]>([]),
		onFinish
	}: {
		ingredients?: RecipeIngredient[];
		onFinish?: () => void;
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
		if (!option.id) return;

		const newIngredient: RecipeIngredient = {
			foodName: option.name_en,
			foodId: option.id,
			amount: null,
			unit: 'gram',
			notes: undefined
		};

		ingredients = [...ingredients, newIngredient];
		query = '';
	}

	function handleProductCreated(event: CustomEvent<Food>) {
		selectOption(event.detail);
		showAddProductDialog = false;
	}

	function removeIngredient(index: number) {
		ingredients = ingredients.filter((_, i) => i !== index);
	}

	function finishAdding() {
		onFinish?.();
	}
</script>

<div class="space-y-4">
	<!-- Search Section -->
	<div class="space-y-2">
		<Label>Search and add ingredients</Label>
		<Command.Root shouldFilter={false} class="rounded-lg border">
			<Command.Input bind:value={query} autofocus placeholder="Type to search ingredients..." />
			<Command.List>
				{#if searchQuery.isPending}
					<!--<Command.Loading>Searching...</Command.Loading>-->
				{:else if query.length >= minChars && (searchQuery.data?.items ?? []).length === 0}
					<div class="py-6 px-4 text-center space-y-3">
						<Command.Empty>No results found for "{query}"</Command.Empty>
					</div>
				{/if}
				{#if query.length >= minChars && (searchQuery.data?.items ?? []).length > 0}
					<Command.Group heading="Click to add ingredient">
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
				{#if query.length >= minChars}
					<div class="py-6 px-4 text-center space-y-3">
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
			</Command.List>
		</Command.Root>
	</div>

	<!-- Added Ingredients List with Inline Editing -->
	{#if ingredients.length > 0}
		<div class="space-y-4">
			<IngredientsList bind:ingredients onRemove={removeIngredient} editable={true} />
			<Button type="button" onclick={finishAdding} class="w-full">
				Finish & Create Recipe ({ingredients.length} ingredient{ingredients.length > 1 ? 's' : ''})
			</Button>
		</div>
	{/if}
</div>

<AddProductDialog
	bind:open={showAddProductDialog}
	on:created={handleProductCreated}
	initialQuery={query}
/>
