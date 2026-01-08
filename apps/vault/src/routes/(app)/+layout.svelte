<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { Toaster } from '../../lib/components/sonner';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<Navbar user={data.user} />
	<main class="flex-1 container mx-auto px-4 py-8">
		{@render children()}
	</main>
</div>

<Toaster />
