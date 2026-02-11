<script lang="ts">
	import * as Card from '$frontend/common/components/card';
	import { Separator } from '$frontend/common/components/separator';
	import type { FoodDto } from '$contracts/cookbook/food/Food.dto';

	let { food }: { food: FoodDto } = $props();
	const nutrientsByCategory = $derived(
		food.nutrients?.reduce(
			(acc, n) => {
				const category = n.nutrient.categoryId || 'Other';

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
						{#each nutrients as { nutrient, amount }}
							<p class="text-sm flex justify-end">
								<span class="text-muted-foreground">
									{nutrient.name.pl || nutrient.name.en}:
								</span>
								<span class="ml-1 font-medium w-20">
									{amount.toFixed(2)}
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
