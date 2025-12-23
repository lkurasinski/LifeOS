<script lang="ts">
	import * as Command from '$lib/components/ui/command';
	import { resource } from 'runed';

	import { createEventDispatcher } from 'svelte';

	type FoodOption = {
		id: string;
		name_pl?: string;
		name_en: string;
		category?: string;
	};

	let placeholder = 'Search ingredient...';
	let minChars = 2;
	let perPage = 10;

	const dispatch = createEventDispatcher<{ select: FoodOption }>();

	let query = $state('');

	const searchResource = resource(
		() => query,
		async (q, prevId, { data, refetching, onCleanup, signal }) => {
			if (q.length < minChars) {
				return;
			}
			try {
				const response = await fetch(
					`/api/foods/search?q=${encodeURIComponent(q)}&per_page=${perPage}`
				);
				return response.json();
			} catch {
				console.error(e);
			}
		},
		{
			debounce: 300
		}
	);

	// The current value of the resource
	searchResource.current;
	// Whether the resource is currently loading
	searchResource.loading;
	// Error if the fetch failed
	searchResource.error;
	searchResource.refetch();

	function selectOption(option: FoodOption) {
		query = option.name_pl ?? option.name_en;
		dispatch('select', option);
	}

	function addAnotherIngredient() {
		saveCurrentStepData();

		selectedFood = null;
		ingredientAmount = 0;
		ingredientUnit = 'gram';
		ingredientNotes = '';

		stepHistory = [...stepHistory, 2];
		currentStep = 2;
		currentStepErrors = [];
	}
</script>

<Command.Root shouldFilter={false} class="rounded-lg border shadow-md md:min-w-[450px]">
	<Command.Input bind:value={query} placeholder="Search ingredient..." />

	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		{#if searchResource.loading}<Command.Loading>Loading</Command.Loading>{/if}
		<Command.Group heading="Suggestions">
			{#each searchResource.current?.items ?? [] as option}
				<Command.Item onSelect={() => selectOption(option)}>
					<span>{option.name_pl ?? option.name_en}</span>
					<div class="text-xs text-muted-foreground">
						{#if option.name_pl && option.name_en}
							{option.name_en}
						{/if}
						{#if option.category}
							· {option.category}
						{/if}
					</div>
				</Command.Item>
			{/each}
		</Command.Group>
	</Command.List>
</Command.Root>
