<script lang="ts">
    import { createEventDispatcher } from 'svelte';

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

    async function searchFoods(q: string) {
        if (q.length < minChars) {
            results = [];
            showDropdown = false;
            return;
        }

        loading = true;
        try {
            const res = await fetch(
                `/api/foods/search?q=${encodeURIComponent(q)}&per_page=${perPage}`
            );
            const data = await res.json();
            results = data.items as FoodOption[];
            showDropdown = results.length > 0;
        } catch (e) {
            console.error(e);
            results = [];
            showDropdown = false;
        } finally {
            loading = false;
        }
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
            on:focus={() => (showDropdown = results.length > 0)}
            on:blur={onBlur}
            {placeholder}
            autocomplete="off"
    />

    {#if loading}
        <div class="absolute right-2 top-2 text-xs text-muted-foreground">
            loading…
        </div>
    {/if}

    {#if showDropdown}
        <div
                class="absolute z-20 mt-1 w-full rounded-md border bg-white shadow-lg max-h-64 overflow-auto"
        >
            {#if results.length === 0 && !loading}
                <div class="px-3 py-2 text-sm text-muted-foreground">
                    No results
                </div>
            {:else}
                {#each results as option}
                    <button
                            type="button"
                            class="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-accent"
                            on:mousedown|preventDefault={() => selectOption(option)}
                    >
                        <span>{option.name_pl ?? option.name_en}</span>
                        <div class="text-xs text-muted-foreground">
                            {#if option.name_pl && option.name_en}
                                {option.name_en}
                            {/if}
                            {#if option.category}
                                · {option.category}
                            {/if}
                        </div>
                    </button>
                {/each}
            {/if}
        </div>
    {/if}
</div>
