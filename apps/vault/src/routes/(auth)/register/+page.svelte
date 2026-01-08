<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '../../../lib/components/button';
	import { Input } from '../../../lib/components/input';
	import { Label } from '../../../lib/components/label';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '../../../lib/components/card';
	import { API_ROUTES } from '$lib/api/api-routes';

	let email = $state('');
	let password = $state('');
	let name = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit() {
		error = '';
		loading = true;

		try {
			const response = await fetch(API_ROUTES.AUTH.REGISTER, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password, name })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Registration failed';
				return;
			}

			// Success - redirect to cookbook
			await goto('/cookbook');
		} catch (err) {
			error = 'Network error. Please try again.';
			console.error('Registration error:', err);
		} finally {
			loading = false;
		}
	}
</script>

<Card>
	<CardHeader class="space-y-1">
		<CardTitle class="text-2xl">Create your account</CardTitle>
		<CardDescription>Start organizing your recipes with LifeOS</CardDescription>
	</CardHeader>
	<CardContent>
		<form class="space-y-4" onsubmit={handleSubmit}>
			{#if error}
				<div class="rounded-md bg-destructive/15 p-3">
					<p class="text-sm text-destructive">{error}</p>
				</div>
			{/if}

			<div class="space-y-2">
				<Label for="name">Name (optional)</Label>
				<Input id="name" bind:value={name} placeholder="Your name" />
			</div>

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
					placeholder="At least 6 characters"
					minlength={6}
					required
				/>
			</div>

			<Button type="submit" class="w-full" disabled={loading}>
				{loading ? 'Creating account...' : 'Sign up'}
			</Button>

			<div class="text-center text-sm">
				<span class="text-muted-foreground">Already have an account?</span>
				<a href="/login" class="text-primary hover:underline ml-1">Sign in</a>
			</div>
		</form>
	</CardContent>
</Card>
