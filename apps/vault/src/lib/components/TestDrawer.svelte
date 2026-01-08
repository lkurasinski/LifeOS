<script lang="ts">
	import * as Drawer from './drawer';
	import { Button } from './button';

	let { open = $bindable(false) }: { open?: boolean } = $props();
</script>

<Drawer.Root bind:open>
	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>Test Drawer</Drawer.Title>
			<Drawer.Description>This is a test</Drawer.Description>
		</Drawer.Header>
		<div class="p-4">
			<p>Drawer content here</p>
		</div>
		<Drawer.Footer>
			<Button onclick={() => (open = false)}>Close</Button>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
