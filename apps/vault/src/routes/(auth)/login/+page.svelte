<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit() {
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Login failed';
				return;
			}

			// Success - redirect to cookbook
			await goto('/cookbook');
		} catch (err) {
			error = 'Network error. Please try again.';
			console.error('Login error:', err);
		} finally {
			loading = false;
		}
	}
</script>

<Card>
	<CardHeader class="space-y-1">
		<CardTitle class="text-2xl">Sign in to LifeOS</CardTitle>
		<CardDescription>Welcome back to your cookbook</CardDescription>
	</CardHeader>
	<CardContent>
		<form class="space-y-4" onsubmit={handleSubmit}>
			{#if error}
				<div class="rounded-md bg-destructive/15 p-3">
					<p class="text-sm text-destructive">{error}</p>
				</div>
			{/if}

			<div class="space-y-2">
				<Label for="email">Email address</Label>
				<Input id="email" type="email" bind:value={email} placeholder="you@example.com" required />
			</div>

			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Your password"
					required
				/>
			</div>

			<Button type="submit" class="w-full" disabled={loading}>
				{loading ? 'Signing in...' : 'Sign in'}
			</Button>

			<div class="text-center text-sm">
				<span class="text-muted-foreground">Don't have an account?</span>
				<a href="/register" class="text-primary hover:underline ml-1">Sign up</a>
			</div>
		</form>
	</CardContent>
</Card>
