<script lang="ts">
	import Button from '../../../../lib/components/button/Button.svelte';
	import Badge from '../../../../lib/components/badge/badge.svelte';
	import Card from '../../../../lib/components/card/card.svelte';
	import CardHeader from '../../../../lib/components/card/card-header.svelte';
	import CardTitle from '../../../../lib/components/card/card-title.svelte';
	import CardDescription from '../../../../lib/components/card/card-description.svelte';
	import CardContent from '../../../../lib/components/card/card-content.svelte';
	import type { Food } from '$domains/cookbook/foods';

	let {
		results = [],
		loading = false,
		source,
		onselect,
		onback
	}: {
		results?: Food[];
		loading?: boolean;
		source: 'fdc' | 'openfoodfacts';
		onselect?: (event: CustomEvent<{ sourceId: string | number }>) => void;
		onback?: () => void;
	} = $props();

	function handleSelect(food: Food) {
		// Extract sourceId from food.source
		if (!food.source?.externalId) {
			console.error('Food missing source information:', food);
			return;
		}

		onselect?.(
			new CustomEvent('select', {
				detail: { sourceId: food.source.externalId }
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
				<Card class="hover:bg-accent/50 transition-colors cursor-pointer">
					<button type="button" class="w-full text-left" onclick={() => handleSelect(food)}>
						<CardHeader class="pb-2">
							<div class="flex items-start justify-between gap-2">
								<CardTitle class="text-base">{food.name_en}</CardTitle>
								<Badge variant="secondary" class="shrink-0 text-xs">
									{getSourceLabel(food.source?.provider)}
								</Badge>
							</div>
							<CardDescription class="text-xs">
								{food.name_pl || food.name_en || food.source?.externalId}
							</CardDescription>
						</CardHeader>
						<CardContent class="pb-3">
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
							</div>
						</CardContent>
					</button>
				</Card>
			{/each}
		</div>
	{/if}
</div>
