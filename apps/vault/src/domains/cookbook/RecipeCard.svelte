<script lang="ts">
	import * as Card from '../../lib/components/card';
	import { Badge } from '../../lib/components/badge';
	import { Clock, Users, ChefHat } from '@lucide/svelte';
	import type { RecipeSearchResult } from '$domains/cookbook/recipe/server/integrations/typesense/recipe.typesense.schema';

	let { recipe }: { recipe: RecipeSearchResult } = $props();

	const totalTime = $derived((recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0) || null);

	const difficultyColor = $derived.by(() => {
		switch (recipe.difficulty) {
			case 'easy':
				return 'bg-green-500/10 text-green-700 dark:text-green-400';
			case 'medium':
				return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
			case 'hard':
				return 'bg-red-500/10 text-red-700 dark:text-red-400';
			default:
				return 'bg-muted text-muted-foreground';
		}
	});
</script>

<Card.Root class="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
	<a href="/cookbook/recipes/{recipe.id}" class="block">
		{#if recipe.imageUrl}
			<div class="aspect-video w-full overflow-hidden bg-muted">
				<img
					src={recipe.imageUrl}
					alt={recipe.namePl}
					class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
				/>
			</div>
		{:else}
			<div class="aspect-video w-full bg-muted flex items-center justify-center">
				<ChefHat class="w-16 h-16 text-muted-foreground/30" />
			</div>
		{/if}

		<Card.Header>
			<div class="flex items-start justify-between gap-2">
				<div class="flex-1 min-w-0">
					<Card.Title class="text-lg line-clamp-2">{recipe.namePl}</Card.Title>
					{#if recipe.nameEn}
						<Card.Description class="line-clamp-1">{recipe.nameEn}</Card.Description>
					{/if}
				</div>
				{#if recipe.difficulty}
					<Badge variant="secondary" class={difficultyColor}>
						{recipe.difficulty}
					</Badge>
				{/if}
			</div>

			{#if recipe.descriptionPl}
				<Card.Description class="line-clamp-2 mt-2">
					{recipe.descriptionPl}
				</Card.Description>
			{/if}
		</Card.Header>

		<Card.Content class="space-y-3">
			<div class="flex flex-wrap gap-3 text-sm text-muted-foreground">
				<div class="flex items-center gap-1.5">
					<Users class="w-4 h-4" />
					<span>{recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}</span>
				</div>

				{#if totalTime}
					<div class="flex items-center gap-1.5">
						<Clock class="w-4 h-4" />
						<span>{totalTime} min</span>
					</div>
				{/if}
			</div>

			{#if recipe.ingredients && recipe.ingredients.length > 0}
				<div>
					<p class="text-xs text-muted-foreground mb-1.5">
						{recipe.ingredients.length} ingredients
					</p>
					<div class="flex flex-wrap gap-1">
						{#each recipe.ingredients.slice(0, 3) as ingredient}
							<Badge variant="outline" class="text-xs">
								{ingredient.food_name_pl ?? ingredient.food_name_en}
							</Badge>
						{/each}
						{#if recipe.ingredients.length > 3}
							<Badge variant="outline" class="text-xs">
								+{recipe.ingredients.length - 3} more
							</Badge>
						{/if}
					</div>
				</div>
			{/if}

			{#if recipe.tags && recipe.tags.length > 0}
				<div class="flex flex-wrap gap-1.5 pt-2 border-t">
					{#each recipe.tags as tag}
						<Badge variant="secondary" class="text-xs">{tag}</Badge>
					{/each}
				</div>
			{/if}
		</Card.Content>

		{#if recipe.userName}
			<Card.Footer class="text-xs text-muted-foreground border-t">
				By {recipe.userName}
			</Card.Footer>
		{/if}
	</a>
</Card.Root>
