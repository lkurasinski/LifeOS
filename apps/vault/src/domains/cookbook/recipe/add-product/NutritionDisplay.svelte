<script lang="ts">
	import * as Card from '$lib/components/card';
	import { Separator } from '$lib/components/separator';
	import type { Food } from '$domains/cookbook/foods';

	let { food }: { food: Food } = $props();
	const nutrientsByCategory = $derived(
		food.nutrients?.reduce(
			(acc, n) => {
				console.log(n);
				const category = n.nutrient.category || 'Other';

				if (!acc[category]) acc[category] = [];
				acc[category].push(n);
				return acc;
			},
			{} as Record<string, typeof food.nutrients>
		)
	);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Nutritional Information (per 100g)</Card.Title>
	</Card.Header>

	<Card.Content>
		<div class="space-y-4">
			{#each nutrientsByCategory && Object.entries(nutrientsByCategory) as [categoryName, nutrients]}
				<div>
					<h4 class="text-sm font-semibold mb-2">{categoryName}</h4>
					<div class="text-right">
						{#each nutrients as { nutrient, value }}
							<p class="text-sm flex justify-end">
								<span class="text-muted-foreground">
									{nutrient.name_pl || nutrient.name_en}:
								</span>
								<span class="ml-1 font-medium w-20">
									{value.toFixed(2)}
									{nutrient.unit}
								</span>
							</p>
						{/each}
					</div>
				</div>
				<Separator />
			{/each}
		</div>
	</Card.Content>
</Card.Root>
