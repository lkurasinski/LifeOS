<script lang="ts">
	import { Moon, Sun } from '@lucide/svelte';
	import { Button } from './button';
	import { useTheme } from '$lib/hooks/useTheme.svelte';

	const theme = useTheme();
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={theme.toggleTheme}
	aria-label="Toggle theme"
	title={theme.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
>
	{#if theme.theme === 'light'}
		<Moon class="h-5 w-5" />
	{:else}
		<Sun class="h-5 w-5" />
	{/if}
</Button>
