<script lang="ts">
	import * as Card from '$lib/components/card';
	import { Badge } from '$lib/components/badge';
	import { Button } from '$lib/components/button';
	import type { FoodDto } from '$contracts/cookbook/food/Food.dto';
	import { getBasicNutrientsString } from '../../foods/utils/food.utils';

	let {
		results = [],
		loading = false,
		source,
		onselect,
		onback
	}: {
		results?: FoodDto[];
		loading?: boolean;
		source: 'fdc' | 'openfoodfacts';
		onselect?: (event: CustomEvent<{ food: FoodDto }>) => void;
		onback?: () => void;
	} = $props();

	function handleSelect(food: FoodDto) {
		// Pass the full food object to reuse already fetched data
		onselect?.(
			new CustomEvent('select', {
				detail: { food }
			})
		);
	}

	function getSourceLabel(sourceType: string | null | undefined): string {
		switch (sourceType) {
			case 'fdc':
				return 'USDA FDC';
			case 'openfoodfacts':
				return 'Open Food Facts';
			default:
				return sourceType || 'Unknown';
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold">Search Results ({results.length})</h3>
		<Button variant="outline" size="sm" onclick={() => onback?.()}>← Back to Search</Button>
	</div>
	{#if loading}
		<div class="text-center py-8 text-muted-foreground">Loading...</div>
	{:else if results.length === 0}
		<div class="text-center py-8 text-muted-foreground">
			No results found. Try a different search term.
		</div>
	{:else}
		<div class="space-y-2 max-h-[500px] overflow-y-auto pr-2">
			{#each results as food}
				<Card.Root class="hover:bg-accent/50 transition-colors cursor-pointer">
					<button type="button" class="w-full text-left" onclick={() => handleSelect(food)}>
						<Card.Header class="pb-2">
							<div class="flex items-start justify-between gap-2">
								<Card.Title class="text-base">{food.name.en}</Card.Title>
								<Badge variant="secondary" class="shrink-0 text-xs">
									{getSourceLabel(food.source?.provider)}
								</Badge>
							</div>
							<Card.Description class="text-xs">
								{food.name.pl || food.name.en || food.source?.externalId}
							</Card.Description>
						</Card.Header>
						<Card.Content class="pb-3">
							<div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
								{#if food.category}
									<span>{food.category}</span>
								{/if}
								{#if food.brand}
									{#if food.category}<span>·</span>{/if}
									<span>Brand: {food.brand}</span>
								{/if}
								{#if food.scientificName}
									<span>·</span>
									<span class="italic">{food.scientificName}</span>
								{/if}
								<div>
									<span>{getBasicNutrientsString(food)}</span>
								</div>
							</div>
						</Card.Content>
					</button>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
