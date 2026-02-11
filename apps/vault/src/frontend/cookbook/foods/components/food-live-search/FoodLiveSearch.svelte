<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import AddProductDialog from '$frontend/cookbook/recipe/add-product/AddProductDialog.svelte';
	import Button from '../../../../../lib/components/button/Button.svelte';

	type FoodOption = {
		id: string;
		name_pl?: string;
		name_en: string;
		category?: string;
	};

	export let placeholder = 'Search ingredient...';
	export let minChars = 2;
	export let perPage = 10;

	const dispatch = createEventDispatcher<{ select: FoodOption }>();

	let query = '';
	let results: FoodOption[] = [];
	let loading = false;
	let showDropdown = false;
	let debounceHandle: ReturnType<typeof setTimeout> | null = null;
	let showAddProductDialog = false;
	let searchedQuery = '';

	async function searchFoods(q: string) {
		if (q.length < minChars) {
			results = [];
			showDropdown = false;
			return;
		}

		loading = true;
		searchedQuery = q;
		try {
			// Uses unified API - defaults to internal source
			const res = await fetch(`/api/foods/search?q=${encodeURIComponent(q)}&pageSize=${perPage}`);
			const data = await res.json();
			// Map domain Food models to FoodOption
			results = (data.data || []).map((food: any) => ({
				id: food.id,
				name_pl: food.name_pl,
				name_en: food.name_en,
				category: food.category
			}));
			showDropdown = true;
		} catch (e) {
			console.error(e);
			results = [];
			showDropdown = false;
		} finally {
			loading = false;
		}
	}

	function openAddProductDialog() {
		showDropdown = false;
		showAddProductDialog = true;
	}

	function handleProductCreated(
		event: CustomEvent<{ id: string; name_pl: string | null; name_en: string }>
	) {
		const { id, name_pl, name_en } = event.detail;
		const newFood: FoodOption = {
			id,
			name_pl: name_pl || undefined,
			name_en
		};
		selectOption(newFood);
		showAddProductDialog = false;
	}

	function onInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;

		if (debounceHandle) clearTimeout(debounceHandle);
		debounceHandle = setTimeout(() => searchFoods(query), 200);
	}

	function selectOption(option: FoodOption) {
		query = option.name_pl ?? option.name_en;
		showDropdown = false;
		dispatch('select', option);
	}

	function onBlur() {
		// small delay so click on option still works
		setTimeout(() => (showDropdown = false), 150);
	}
</script>

<div class="relative w-full">
	<input
		class="w-full border px-3 py-2 rounded-md"
		type="text"
		bind:value={query}
		on:input={onInput}
		on:focus={() => {
			// Show dropdown if we have results OR if we have a query that was searched
			if (results.length > 0 || (searchedQuery && searchedQuery === query)) {
				showDropdown = true;
			}
		}}
		on:blur={onBlur}
		{placeholder}
		autocomplete="off"
	/>

	{#if loading}
		<div class="absolute right-2 top-2 text-xs text-muted-foreground">loading…</div>
	{/if}

	{#if showDropdown}
		<div
			class="absolute z-20 mt-1 w-full rounded-md border bg-white shadow-lg max-h-64 overflow-auto"
		>
			{#if results.length === 0 && !loading}
				<div class="px-3 py-2 text-sm text-muted-foreground">No results</div>
			{:else}
				{#each results as option}
					<button
						type="button"
						class="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-accent"
						on:mousedown|preventDefault={() => selectOption(option)}
					>
						<span>{option.name_pl ?? option.name_en}</span>
						<span class="text-xs text-muted-foreground">
							{#if option.name_pl && option.name_en}
								{option.name_en}
							{/if}
							{#if option.category}
								· {option.category}
							{/if}
						</span>
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>
