<script lang="ts">
	import { Input } from '../../lib/components/input';
	import { Button } from '../../lib/components/button';
	import { Badge } from '../../lib/components/badge';
	import * as Select from '../../lib/components/select';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '../../lib/components/card';
	import RecipeCard from './RecipeCard.svelte';
	import { Search, X } from '@lucide/svelte';
	import type { RecipeSearchResult } from '$domains/cookbook/recipe/recipe.schema';

	let searchQuery = $state('');
	let selectedDifficulty = $state<string | undefined>(undefined);
	let selectedTags = $state<string[]>([]);
	let recipes = $state<RecipeSearchResult[]>([]);
	let total = $state(0);
	let isLoading = $state(false);
	let page = $state(1);
	const perPage = 12;

	let debounceTimeout: ReturnType<typeof setTimeout> | undefined;

	async function fetchRecipes() {
		isLoading = true;
		try {
			const params = new URLSearchParams({
				q: searchQuery || '*',
				per_page: perPage.toString(),
				page: page.toString()
			});

			if (selectedDifficulty) {
				params.append('difficulty', selectedDifficulty);
			}

			if (selectedTags.length > 0) {
				params.append('tags', selectedTags.join(','));
			}

			const response = await fetch(`/api/recipes/search?${params}`);
			const data = await response.json();

			recipes = data.items;
			total = data.total;
		} catch (error) {
			console.error('Failed to fetch recipes:', error);
			recipes = [];
			total = 0;
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		searchQuery;
		selectedDifficulty;
		selectedTags;

		if (debounceTimeout) clearTimeout(debounceTimeout);

		debounceTimeout = setTimeout(() => {
			page = 1;
			fetchRecipes();
		}, 300);

		return () => {
			if (debounceTimeout) clearTimeout(debounceTimeout);
		};
	});

	function clearFilters() {
		searchQuery = '';
		selectedDifficulty = undefined;
		selectedTags = [];
		page = 1;
	}

	function removeTag(tag: string) {
		selectedTags = selectedTags.filter((t) => t !== tag);
	}

	function goToPage(newPage: number) {
		page = newPage;
		fetchRecipes();
	}

	const hasActiveFilters = $derived(
		searchQuery !== '' || selectedDifficulty !== undefined || selectedTags.length > 0
	);

	export function refresh() {
		fetchRecipes();
	}
</script>

{console.log(recipes)}
<div class="space-y-6">
	<!-- Search and Filters -->
	<div class="flex flex-col gap-4">
		<div class="flex gap-4">
			<div class="relative flex-1">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<Input type="text" bind:value={searchQuery} placeholder="Search recipes..." class="pl-9" />
			</div>

			<Select.Root type="single" bind:value={selectedDifficulty}>
				<Select.Trigger class="w-[180px]">
					{#if selectedDifficulty}
						{selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
					{:else}
						Difficulty
					{/if}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Label>Difficulty</Select.Label>
						<Select.Item value={''} label="All">All</Select.Item>
						<Select.Item value="easy" label="Easy">Easy</Select.Item>
						<Select.Item value="medium" label="Medium">Medium</Select.Item>
						<Select.Item value="hard" label="Hard">Hard</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root>

			{#if hasActiveFilters}
				<Button variant="outline" onclick={clearFilters}>
					<X class="w-4 h-4 mr-2" />
					Clear
				</Button>
			{/if}
		</div>

		{#if selectedTags.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each selectedTags as tag}
					<Badge variant="secondary" class="gap-1">
						{tag}
						<button
							onclick={() => removeTag(tag)}
							class="ml-1 hover:bg-muted-foreground/20 rounded-full"
						>
							<X class="w-3 h-3" />
						</button>
					</Badge>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Results Count -->
	{#if !isLoading}
		<p class="text-sm text-muted-foreground">
			{#if total === 0}
				No recipes found
			{:else if total === 1}
				1 recipe found
			{:else}
				{total} recipes found
			{/if}
		</p>
	{/if}

	<!-- Recipe Grid -->
	{#if isLoading}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each Array.from({ length: perPage }) as _}
				<div class="h-96 bg-muted animate-pulse rounded-lg"></div>
			{/each}
		</div>
	{:else if recipes.length === 0}
		<div class="text-center py-12">
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
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each recipes as recipe (recipe.id)}
				<RecipeCard {recipe} />
			{/each}
		</div>
	{/if}

	<!-- Pagination -->
	{#if total > perPage}
		<div class="flex justify-center gap-2">
			<Button variant="outline" disabled={page === 1} onclick={() => goToPage(page - 1)}>
				Previous
			</Button>
			<span class="flex items-center px-4 text-sm text-muted-foreground">
				Page {page} of {Math.ceil(total / perPage)}
			</span>
			<Button
				variant="outline"
				disabled={page >= Math.ceil(total / perPage)}
				onclick={() => goToPage(page + 1)}
			>
				Next
			</Button>
		</div>
	{/if}
</div>
