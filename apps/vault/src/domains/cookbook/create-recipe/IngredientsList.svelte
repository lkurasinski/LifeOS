<script lang="ts">
	import { Button } from '../../../lib/components/button';
	import { Input } from '../../../lib/components/input';
	import { Label } from '../../../lib/components/label';
	import * as Select from '../../../lib/components/select';
	import { fly, scale, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { RecipeIngredient } from '$domains/cookbook/recipe/recipe.schema';

	let {
		ingredients = $bindable<RecipeIngredient[]>([]),
		onRemove,
		showTitle = true,
		editable = false
	}: {
		ingredients?: RecipeIngredient[];
		onRemove?: (index: number) => void;
		showTitle?: boolean;
		editable?: boolean;
	} = $props();

	function updateIngredient(index: number, field: keyof RecipeIngredient, value: any) {
		ingredients = ingredients.map((ing, i) =>
			i === index ? { ...ing, [field]: value } : ing
		);
	}
</script>

{#if ingredients.length > 0}
	<div class="space-y-2" in:fade={{ duration: 300 }}>
		{#if showTitle}
			<h4 class="text-sm font-semibold">Added Ingredients ({ingredients.length})</h4>
		{/if}
		<div class="space-y-3">
			{#each ingredients as ingredient, index (ingredient.foodId + index)}
				<div
					class="p-3 border rounded-lg bg-background space-y-3"
					in:fly={{ x: -20, duration: 300, delay: index * 50, easing: cubicOut }}
					out:scale={{ duration: 200, easing: cubicOut }}
				>
					<div class="flex items-center justify-between">
						<p class="font-medium">{ingredient.foodName}</p>
						{#if onRemove}
							<Button type="button" variant="ghost" size="sm" onclick={() => onRemove(index)}>
								Remove
							</Button>
						{/if}
					</div>

					{#if editable}
						<div class="grid grid-cols-3 gap-2">
							<div class="space-y-1.5">
								<Label for="amount-{index}" class="text-xs">Amount *</Label>
								<Input
									id="amount-{index}"
									type="number"
									min="0"
									step="0.1"
									value={ingredient.amount}
									oninput={(e) =>
										updateIngredient(index, 'amount', parseFloat(e.currentTarget.value) || null)}
									placeholder="100"
									class="h-9"
								/>
							</div>

							<div class="space-y-1.5">
								<Label for="unit-{index}" class="text-xs">Unit</Label>
								<Select.Root
									type="single"
									name="unit-{index}"
									value={ingredient.unit}
									onValueChange={(value) => updateIngredient(index, 'unit', value)}
								>
									<Select.Trigger class="h-9">
										{ingredient.unit === 'gram' ? 'g' : 'ml'}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Item value="gram" label="Grams">g</Select.Item>
											<Select.Item value="ml" label="Milliliters">ml</Select.Item>
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</div>

							<div class="space-y-1.5">
								<Label for="notes-{index}" class="text-xs">Notes</Label>
								<Input
									id="notes-{index}"
									type="text"
									value={ingredient.notes || ''}
									oninput={(e) => updateIngredient(index, 'notes', e.currentTarget.value || undefined)}
									placeholder="optional"
									class="h-9"
								/>
							</div>
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">
							{#if ingredient.amount}
								{ingredient.amount}
								{ingredient.unit}
								{#if ingredient.notes}• {ingredient.notes}{/if}
							{:else if ingredient.notes}
								{ingredient.notes}
							{/if}
						</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}
