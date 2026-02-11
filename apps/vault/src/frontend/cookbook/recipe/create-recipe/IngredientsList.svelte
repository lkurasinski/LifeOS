<script lang="ts">
	import { fly, scale, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION } from '$frontend/common/constants/ui';
	import type { RecipeIngredient } from '$frontend/cookbook/recipe/recipe.schema';
	import { Label } from '$frontend/common/components/label';
	import { Input } from '$frontend/common/components/input';
	import * as Select from '$frontend/common/components/select';
	import { Button } from '$frontend/common/components/button';

	let {
		ingredients = $bindable<RecipeIngredient[]>([]),
		onRemove,
		onClick,
		showTitle = true,
		editable = false
	}: {
		ingredients?: RecipeIngredient[];
		onRemove?: (index: number) => void;
		onClick?: (index: number) => void;
		showTitle?: boolean;
		editable?: boolean;
	} = $props();

	function updateIngredient(index: number, field: keyof RecipeIngredient, value: any) {
		ingredients = ingredients.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing));
	}
</script>

{#if ingredients.length > 0}
	<div class="space-y-2" in:fade={{ duration: ANIMATION.DURATION.NORMAL }}>
		{#if showTitle}
			<h4 class="text-sm font-semibold">Added Ingredients ({ingredients.length})</h4>
		{/if}
		<div class="space-y-3 overflow-x-hidden">
			<!-- 0 just for typesafety -->
			{#each ingredients as ingredient, index (ingredient.food.id || 0 + index)}
				<div
					class="p-3 border rounded-lg bg-background space-y-3 text-card-foreground bg-card"
					in:fly={{
						x: -20,
						duration: ANIMATION.DURATION.NORMAL,
						delay: index * ANIMATION.STAGGER_DELAY,
						easing: cubicOut
					}}
					out:fly={{
						x: 200,
						duration: ANIMATION.DURATION.NORMAL,
						delay: index * ANIMATION.STAGGER_DELAY,
						easing: cubicOut
					}}
				>
					<div class="flex items-center justify-between">
						<p class="font-medium">
							{ingredient.food.name}
						</p>
						<div>
							<Button type="button" variant="ghost" size="sm" onclick={() => onClick?.(index)}>
								Szczegóły
							</Button>
							{#if onRemove}
								<Button type="button" variant="ghost" size="sm" onclick={() => onRemove(index)}>
									Remove
								</Button>
							{/if}
						</div>
					</div>

					{#if editable}
						<div class="grid grid-cols-3 gap-2">
							<div class="space-y-1.5">
								<Label for="amount-{index}" class="text-xs">Amount *</Label>
								<Input
									id="amount-{index}"
									type="text"
									value={ingredient.amount}
									oninput={(e) =>
										updateIngredient(index, 'amount', parseFloat(e.currentTarget.value) || null)}
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
									oninput={(e) =>
										updateIngredient(index, 'notes', e.currentTarget.value || undefined)}
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
