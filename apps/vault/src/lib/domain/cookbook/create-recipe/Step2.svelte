<script lang="ts">
	import * as Command from '$lib/components/ui/command';
	import { Label } from '$lib/components/ui/label';
	import { resource } from 'runed';
	import type { RecipeIngredient } from '$lib/schemas/recipe';
	import IngredientsList from './IngredientsList.svelte';

	type FoodOption = {
		id: string;
		name_pl?: string;
		name_en: string;
		category?: string;
	};

	let {
		selectedFood = $bindable<FoodOption | null>(null),
		ingredients = [],
		onSelect
	}: {
		selectedFood?: FoodOption | null;
		ingredients?: RecipeIngredient[];
		onSelect?: () => void;
	} = $props();

	let query = $state('');
	let minChars = 2;
	let perPage = 10;

	const searchResource = resource(
		() => query,
		async (q) => {
			if (q.length < minChars) {
				return { items: [] };
			}
			try {
				const response = await fetch(
					`/api/foods/search?q=${encodeURIComponent(q)}&per_page=${perPage}`
				);
				return await response.json();
			} catch (error) {
				console.error(error);
				return { items: [] };
			}
		},
		{
			debounce: 300
		}
	);

	function selectOption(option: FoodOption) {
		selectedFood = option;
		query = option.name_pl ?? option.name_en;
		onSelect?.();
	}
</script>

<div class="space-y-2">
	<Label>Search for ingredient</Label>
	<Command.Root shouldFilter={false} class="rounded-lg border shadow-md">
		<Command.Input bind:value={query} placeholder="Type to search ingredients..." />
		<Command.List>
			{#if searchResource.loading}
				<!--				<Command.Loading>Searching...</Command.Loading>-->
			{:else if query.length >= minChars && (searchResource.current?.items ?? []).length === 0}
				<Command.Empty>No results found.</Command.Empty>
			{/if}
			{#if (searchResource.current?.items ?? []).length > 0}
				<Command.Group heading="Select ingredient">
					{#each searchResource.current?.items ?? [] as option}
						<Command.Item value={option.id} onSelect={() => selectOption(option)}>
							<div class="flex flex-col">
								<span class="font-medium">{option.name_pl ?? option.name_en}</span>
								<div class="text-xs text-muted-foreground">
									{#if option.name_pl && option.name_en}
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
