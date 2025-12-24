<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { fly, scale, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { RecipeIngredient } from '$lib/schemas/recipe';

	let {
		ingredients = [],
		onRemove,
		showTitle = true
	}: {
		ingredients: RecipeIngredient[];
		onRemove?: (index: number) => void;
		showTitle?: boolean;
	} = $props();
</script>

{#if ingredients.length > 0}
	<div class="space-y-2" in:fade={{ duration: 300 }}>
		{#if showTitle}
			<h4 class="text-sm font-semibold">Added Ingredients ({ingredients.length})</h4>
		{/if}
		<div class="space-y-2">
			{#each ingredients as ingredient, index (ingredient.foodId + index)}
				<div
					class="flex items-center justify-between p-3 border rounded-lg bg-background"
					in:fly={{ x: -20, duration: 300, delay: index * 50, easing: cubicOut }}
					out:scale={{ duration: 200, easing: cubicOut }}
				>
					<div class="flex-1">
						<p class="font-medium">{ingredient.foodName}</p>
						<p class="text-sm text-muted-foreground">
							{ingredient.amount}
							{ingredient.unit}
							{#if ingredient.notes}• {ingredient.notes}{/if}
						</p>
					</div>
					{#if onRemove}
						<Button type="button" variant="ghost" size="sm" onclick={() => onRemove(index)}>
							Remove
						</Button>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}
