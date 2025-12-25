<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import RecipesCatalog from '$lib/domain/cookbook/RecipesCatalog.svelte';
	import NewRecipeForm from '$lib/components/NewRecipeForm.svelte';
	import MultiStepRecipeForm from '$lib/domain/cookbook/create-recipe/MultiStepRecipeForm.svelte';
	import TestDrawer from '$lib/components/TestDrawer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isFormOpen = $state(false);
	let isTestOpen = $state(false);
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
			<Button onclick={() => (isTestOpen = true)} variant="outline">Test Drawer</Button>
			<Button onclick={() => (isMultiStepOpen = true)} variant="outline">Test Drawer2</Button>
			<Button onclick={() => (isFormOpen = true)}>
				<span class="mr-2">+</span>
				New Recipe
			</Button>
		</div>
	</div>

	<RecipesCatalog bind:this={catalogRef} />
</div>

<TestDrawer bind:open={isTestOpen} />
<NewRecipeForm bind:open={isFormOpen} onSuccess={handleRecipeCreated} />
<MultiStepRecipeForm bind:open={isMultiStepOpen} onSuccess={handleRecipeCreated} />
