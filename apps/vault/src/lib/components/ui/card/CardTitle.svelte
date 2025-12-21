<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		class?: string;
	}

	let { class: className, ...restProps }: Props = $props();
</script>

<h3
	class={cn('text-2xl font-semibold leading-none tracking-tight', className)}
	{...restProps}
>
	<slot />
</h3>
