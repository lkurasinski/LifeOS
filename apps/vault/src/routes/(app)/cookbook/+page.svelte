<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import NewRecipeForm from '$lib/components/NewRecipeForm.svelte';
	import MultiStepRecipeForm from '$lib/components/MultiStepRecipeForm.svelte';
	import TestDrawer from '$lib/components/TestDrawer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isFormOpen = $state(false);
	let isTestOpen = $state(false);
	let isMultiStepOpen = $state(false);

	function handleRecipeCreated() {
		// Reload the page data to show the new recipe
		// This will be handled by invalidateAll in the form
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">My Recipes</h1>
			<p class="text-muted-foreground">Manage your personal collection of recipes</p>
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

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Placeholder cards - will be replaced with actual recipes later -->
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
</div>

<TestDrawer bind:open={isTestOpen} />
<NewRecipeForm bind:open={isFormOpen} onSuccess={handleRecipeCreated} />
<MultiStepRecipeForm bind:open={isMultiStepOpen} onSuccess={handleRecipeCreated} />
