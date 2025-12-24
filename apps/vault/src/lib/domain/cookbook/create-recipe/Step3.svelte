<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { InputNumber } from '$lib/components/ui/input-number';
	import type { RecipeIngredient } from '$lib/schemas/recipe';
	import IngredientsList from './IngredientsList.svelte';

	type FoodOption = {
		id: string;
		name_pl?: string;
		name_en: string;
		category?: string;
	};

	let {
		selectedFood,
		ingredients = $bindable<RecipeIngredient[]>([]),
		submitting = false,
		onAddAnother,
		onFinish
	}: {
		selectedFood: FoodOption;
		ingredients?: RecipeIngredient[];
		submitting?: boolean;
		onAddAnother?: () => void;
		onFinish?: () => void;
	} = $props();

	let ingredientAmount = $state(0);
	let ingredientUnit = $state<RecipeIngredient['unit']>('gram');
	let ingredientNotes = $state('');

	function addIngredient() {
		const newIngredient: RecipeIngredient = {
			foodName: selectedFood.name_en,
			foodId: selectedFood.id,
			amount: ingredientAmount || 0,
			unit: ingredientUnit,
			notes: ingredientNotes || undefined
		};

		ingredients = [...ingredients, newIngredient];

		// Reset form
		ingredientAmount = 0;
		ingredientUnit = 'gram';
		ingredientNotes = '';

		// Trigger add another callback
		onAddAnother?.();
	}

	function removeIngredient(index: number) {
		ingredients = ingredients.filter((_, i) => i !== index);
	}

	function finishAdding() {
		// Add current ingredient if there's data
		if (ingredientAmount > 0) {
			addIngredient();
		}
		onFinish?.();
	}
</script>

<div class="space-y-4">
	<!-- Current Ingredient Info -->
	<div class="p-3 border rounded-lg bg-muted/50">
		<p class="text-sm font-semibold">
			Adding: {selectedFood.name_pl ?? selectedFood.name_en}
		</p>
		{#if selectedFood.name_pl && selectedFood.name_en}
			<p class="text-xs text-muted-foreground">{selectedFood.name_en}</p>
		{/if}
	</div>

	<!-- Ingredient Details Form -->
	<div class="grid gap-3 sm:grid-cols-3">
		<div class="space-y-2">
			<Label for="amount">Amount *</Label>
			<InputNumber
				id="amount"
				min="0"
				step="0.1"
				bind:value={ingredientAmount}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						addIngredient();
					}
				}}
				placeholder="100"
				autofocus
			/>
		</div>

		<div class="space-y-2">
			<Label for="unit">Unit</Label>
			<Select.Root type="single" name="unit" bind:value={ingredientUnit}>
				<Select.Trigger class="w-full">
					{ingredientUnit === 'gram' ? 'Grams (g)' : 'Milliliters (ml)'}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Label>Unit</Select.Label>
						<Select.Item value="gram" label="Grams (g)">Grams (g)</Select.Item>
						<Select.Item value="ml" label="Milliliters (ml)">Milliliters (ml)</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="space-y-2">
			<Label for="notes">Notes</Label>
			<Input id="notes" type="text" bind:value={ingredientNotes} placeholder="e.g., diced" />
		</div>
	</div>

	<Button type="button" onclick={addIngredient} class="w-full" variant="secondary">
		Add & Select Another Ingredient
	</Button>

	<!-- Added Ingredients List -->
	<IngredientsList {ingredients} onRemove={removeIngredient} />

	{#if ingredients.length > 0}
		<Button
			type="button"
			onclick={finishAdding}
			class="w-full mt-4"
			disabled={ingredients.length === 0 || submitting}
		>
			{submitting ? 'Creating Recipe...' : 'Finish & Create Recipe'}
		</Button>
	{/if}
</div>
