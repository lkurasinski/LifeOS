<script lang="ts">
	import * as Card from '$frontend/common/components/card';
	import { Badge } from '$frontend/common/components/badge';
	import type { FoodDto } from '$contracts/cookbook/food/Food.dto';

	let { food }: { food: FoodDto } = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Product Information</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-1">
				<p class="text-sm font-medium text-muted-foreground">Name (English)</p>
				<p class="text-sm">{food.name.en}</p>
			</div>

			{#if food.name.pl}
				<div class="space-y-1">
					<p class="text-sm font-medium text-muted-foreground">Name (Polish)</p>
					<p class="text-sm">{food.name.pl}</p>
				</div>
			{/if}
		</div>

		{#if food.category || food.scientificName}
			<div class="grid grid-cols-2 gap-4">
				{#if food.category}
					<div class="space-y-1">
						<p class="text-sm font-medium text-muted-foreground">Category</p>
						<p class="text-sm">{food.category}</p>
					</div>
				{/if}

				{#if food.scientificName}
					<div class="space-y-1">
						<p class="text-sm font-medium text-muted-foreground">Scientific Name</p>
						<p class="text-sm italic">{food.scientificName}</p>
					</div>
				{/if}
			</div>
		{/if}

		{#if food.brand}
			<div class="space-y-1">
				<p class="text-sm font-medium text-muted-foreground">Brand</p>
				<p class="text-sm">{food.brand}</p>
			</div>
		{/if}

		{#if food.source}
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<Badge variant="outline">
					{food.source.provider === 'fdc'
						? 'USDA FDC'
						: food.source.provider === 'home-baked'
							? 'Home baked'
							: 'Open Food Facts'}
				</Badge>
				{#if food.source.externalId}
					<span>Source ID: {food.source.externalId}</span>
				{/if}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
