<script lang="ts">
	import { marked } from 'marked';
	import { Label } from '$frontend/common/components/label';
	import * as Tabs from '$frontend/common/components/tabs';

	let {
		value = $bindable(''),
		label,
		placeholder = 'Enter markdown...',
		rows = 10
	}: {
		value?: string;
		label?: string;
		placeholder?: string;
		rows?: number;
	} = $props();

	// Configure marked for safe HTML
	marked.setOptions({
		breaks: true,
		gfm: true
	});

	const preview = $derived.by(() => {
		if (!value) return '';
		try {
			return marked.parse(value);
		} catch (e) {
			console.error('Markdown parse error:', e);
			return value;
		}
	});
</script>

<div class="space-y-2">
	{#if label}
		<Label>{label}</Label>
	{/if}

	<Tabs.Root value="source" class="w-full">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="source">Source</Tabs.Trigger>
			<Tabs.Trigger value="preview">Preview</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="preview" class="mt-2">
			<div
				class="min-h-[200px] rounded-md border border-input bg-background p-4 text-sm overflow-y-auto"
				style="min-height: {rows * 1.5}rem; max-height: {rows * 2}rem"
			>
				{#if value}
					<div class="prose prose-sm max-w-none dark:prose-invert">
						{@html preview}
					</div>
				{:else}
					<p class="text-muted-foreground italic">{placeholder}</p>
				{/if}
			</div>
		</Tabs.Content>

		<Tabs.Content value="source" class="mt-2">
			<textarea
				bind:value
				{placeholder}
				{rows}
				class="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
			></textarea>
		</Tabs.Content>
	</Tabs.Root>

	<p class="text-xs text-muted-foreground">
		Markdown supported: **bold**, *italic*, # headers, lists, links, and more
	</p>
</div>
