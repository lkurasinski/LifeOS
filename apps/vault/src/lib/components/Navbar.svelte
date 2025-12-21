<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from './ui/button';

	interface Props {
		user?: {
			name: string | null;
			email: string;
		};
	}

	let { user }: Props = $props();
	let loading = $state(false);

	async function handleLogout() {
		loading = true;
		try {
			await fetch('/api/auth/logout', {
				method: 'POST'
			});
			await goto('/login');
		} catch (err) {
			console.error('Logout error:', err);
		} finally {
			loading = false;
		}
	}
</script>

<nav class="border-b bg-background">
	<div class="container mx-auto px-4">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center gap-6">
				<a href="/cookbook" class="text-xl font-bold">LifeOS Cookbook</a>
				<div class="hidden md:flex gap-4">
					<a href="/cookbook" class="text-sm font-medium text-muted-foreground hover:text-foreground">
						Recipes
					</a>
					<a
						href="/cookbook/new"
						class="text-sm font-medium text-muted-foreground hover:text-foreground"
					>
						New Recipe
					</a>
				</div>
			</div>

			{#if user}
				<div class="flex items-center gap-4">
					<span class="text-sm text-muted-foreground hidden sm:block">
						{user.name || user.email}
					</span>
					<Button variant="outline" size="sm" onclick={handleLogout} disabled={loading}>
						{loading ? 'Logging out...' : 'Logout'}
					</Button>
				</div>
			{/if}
		</div>
	</div>
</nav>
