<script lang="ts">
	import { Button } from '$frontend/common/components/button';
	import RecipesCatalog from '$frontend/cookbook/recipe/RecipesCatalog.svelte';
	import MultiStepRecipeForm from '$frontend/cookbook/recipe/create-recipe/MultiStepRecipeForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isMultiStepOpen = $state(false);
	let catalogRef: RecipesCatalog;

	function handleRecipeCreated() {
		catalogRef?.refresh();
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Recipes</h1>
			<p class="text-muted-foreground">Discover and manage your recipes</p>
		</div>
		<div class="flex gap-2">
			<Button onclick={() => (isMultiStepOpen = true)} variant="outline">Dodaj przepis</Button>
		</div>
	</div>

	<RecipesCatalog bind:this={catalogRef} />
</div>

<MultiStepRecipeForm bind:open={isMultiStepOpen} onSuccess={handleRecipeCreated} />
