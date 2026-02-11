<script lang="ts">
	import * as Command from '$lib/components/command';
	import * as Dialog from '$lib/components/dialog';
	import { useFoodSearch } from '$lib/hooks/useFoodSearch.svelte.js';
	import type { RecipeIngredient } from '$frontend/cookbook/recipe/recipe.schema';
	import IngredientsList from './IngredientsList.svelte';
	import AddProductDialog from '../add-product/AddProductDialog.svelte';
	import FoodInfoDisplay from '../add-product/FoodInfoDisplay.svelte';
	import NutritionDisplay from '../add-product/NutritionDisplay.svelte';
	import { Label } from '$lib/components/label';
	import { Button } from '$lib/components/button';
	import { LAYOUT } from '$lib/constants/ui';
	import type { FoodDto } from '$contracts/cookbook/food/Food.dto';
	import { getBasicNutrientsString } from '$frontend/cookbook/foods/utils/food.utils';

	// Extended ingredient type with full Food data for UI purposes
	type IngredientWithFood = RecipeIngredient & {
		food?: FoodDto;
	};

	let {
		ingredients = $bindable<RecipeIngredient[]>([]),
		onNext,
		onFinish
	}: {
		ingredients?: RecipeIngredient[];
		onNext?: () => void;
		onFinish?: () => void;
	} = $props();

	// Compute list of already-added ingredient IDs to exclude from search
	const excludeIds = $derived(
		ingredients.map((ing) => ing.food?.id).filter((id): id is number => !!id)
	);

	const search = useFoodSearch(() => ({
		provider: 'home-baked',
		exclude: excludeIds,
		page: 1
	}));
	let showAddProductDialog = $state(false);
	let showIngredientDetail = $state(false);
	let selectedFoodDetail = $state<FoodDto | null>(null);

	function selectOption(option: FoodDto) {
		if (!option.id) return;

		// Safety check: Prevent adding duplicate ingredients
		const isDuplicate = ingredients.some((ing) => ing.food?.id === option.id);
		if (isDuplicate) {
			console.warn(`Ingredient "${option.name.pl || option.name.en}" is already added`);
			return;
		}

		// Store full food data alongside ingredient
		const newIngredient: RecipeIngredient = {
			food: option,
			amount: null,
			unit: 'gram',
			notes: undefined
		};

		ingredients = [...ingredients, newIngredient];
		search.clearQuery();
	}

	function handleProductCreated(food: FoodDto) {
		selectOption(food);
		showAddProductDialog = false;
	}

	function removeIngredient(index: number) {
		ingredients = ingredients.filter((_, i) => i !== index);
	}

	function finishAdding() {
		onFinish?.();
	}

	function handleIngredientClick(index: number) {
		const ingredient = ingredients[index];

		// Reuse food data stored with ingredient - no API call needed!
		if (ingredient.food) {
			selectedFoodDetail = ingredient.food;
			showIngredientDetail = true;
		}
	}
</script>

<div class="space-y-4">
	<!-- Search Section -->
	<div class="space-y-2">
		<Label>Search and add ingredients</Label>
		<Command.Root shouldFilter={false} class="rounded-lg border">
			<Command.Input
				bind:value={search.query}
				autofocus
				placeholder="Type to search ingredients..."
			/>

			<Command.List>
				{#if search.isLoading}
					<Command.Loading>Searching...</Command.Loading>
				{:else if search.query.length >= 2 && search.results.length === 0}
					<div class="py-6 px-4 text-center space-y-3">
						<Command.Empty>No results found for "{search.query}"</Command.Empty>
					</div>
				{/if}
				{#if search.query.length >= 2 && search.results.length > 0}
					<Command.Group heading="Click to add ingredient">
						{#each search.results as option}
							<Command.Item
								value={option.id?.toString() || option.name.en}
								onSelect={() => selectOption(option)}
							>
								<div class="w-full">
									<p class="font-medium">{option.name.pl ?? option.name.en}</p>
									<p class="text-xs text-muted-foreground flex justify-between">
										<span>
											{#if option.name.pl || option.name.en}
												{option.name.en}
											{/if}
											{#if option.category}
												· {option.category}
											{/if}
										</span>

										<span>{getBasicNutrientsString(option)}</span>
									</p>
								</div>
							</Command.Item>
						{/each}
					</Command.Group>
				{/if}
				{#if search.query.length >= 2}
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
			<IngredientsList
				bind:ingredients
				onRemove={removeIngredient}
				onClick={handleIngredientClick}
				editable={true}
			/>

			<div class="flex flex-col gap-2">
				<Button type="button" onclick={() => onNext?.()} class="w-full">
					Next: Add Instructions
				</Button>
				<Button type="button" variant="outline" onclick={finishAdding} class="w-full">
					Skip Instructions & Create Recipe
				</Button>
			</div>
		</div>
	{/if}
</div>

<AddProductDialog
	bind:open={showAddProductDialog}
	onCreated={handleProductCreated}
	initialQuery={search.query}
/>

<Dialog.Root bind:open={showIngredientDetail}>
	<Dialog.Content class="max-w-3xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Ingredient Details</Dialog.Title>
			<Dialog.Description>View nutritional information for this ingredient</Dialog.Description>
		</Dialog.Header>

		{#if selectedFoodDetail}
			<div class="space-y-4" style="max-height: {LAYOUT.MODAL_MAX_HEIGHT}; overflow-y: auto;">
				<FoodInfoDisplay food={selectedFoodDetail} />
				<NutritionDisplay food={selectedFoodDetail} />
			</div>
			<div class="flex justify-end">
				<Button variant="outline" onclick={() => (showIngredientDetail = false)}>Close</Button>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
