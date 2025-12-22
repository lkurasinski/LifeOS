<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import type { PageData } from './$types';
	import {FoodAutocomplete} from '$lib/components/ui/ingredient-select';

	type Ingredient = {
		foodId: string;
		label: string;
		amountGrams: number;
	};

	let ingredients: Ingredient[] = [];

	function handleSelectFood(e: CustomEvent<{ id: string; name_pl?: string; name_en: string }>) {
		const item = e.detail;
		ingredients = [
			...ingredients,
			{
				foodId: item.id,
				label: item.name_pl ?? item.name_en,
				amountGrams: 0
			}
		];
	}

	async function submit() {
		const payload = {
			titlePl: 'New recipe',
			servings: 1,
			ingredients: ingredients.map((i, idx) => ({
				foodId: i.foodId,
				amountGrams: i.amountGrams,
				order: idx
			})),
			instructions: [{ stepNumber: 1, textPl: 'Step 1' }]
		};

		await fetch('/api/recipes', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(payload)
		});
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">My Recipes</h1>
			<p class="text-muted-foreground">
				Manage your personal collection of recipes
			</p>
		</div>
		<Button href="/cookbook/new">
			<span class="mr-2">+</span>
			New Recipe
		</Button>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Placeholder cards - will be replaced with actual recipes later -->
		<Card>
			<CardHeader>
				<CardTitle>No recipes yet</CardTitle>
				<CardDescription>Start by creating your first recipe</CardDescription>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground">
					Click the "New Recipe" button to add your favorite dishes to your cookbook.
				</p>
			</CardContent>
		</Card>
	</div>




	<form on:submit|preventDefault={submit}>
		<FoodAutocomplete on:select={handleSelectFood} />

		{#each ingredients as ing, i}
			<div class="mt-2 flex gap-2 items-center">
				<span class="w-64 truncate">{ing.label}</span>
				<input
						type="number"
						min="0"
						step="1"
						bind:value={ing.amountGrams}
						class="w-24 border px-2 py-1 text-right"
						placeholder="g"
				/>
			</div>
		{/each}

		<button type="submit" class="mt-4 border px-3 py-2 rounded-md">
			Save recipe
		</button>
	</form>

</div>
