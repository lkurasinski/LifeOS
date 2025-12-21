<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-background">
	<div class="w-full max-w-md">
		{@render children()}
	</div>
</div>
