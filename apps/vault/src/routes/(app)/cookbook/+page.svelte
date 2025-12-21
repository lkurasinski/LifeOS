<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">My Recipes</h1>
			<p class="text-muted-foreground">
				Manage your personal collection of recipes
			</p>
		</div>
		<Button href="/cookbook/new">
			<span class="mr-2">+</span>
			New Recipe
		</Button>
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
