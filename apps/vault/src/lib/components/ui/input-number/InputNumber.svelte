<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'type'> {
		value?: number | null;
		class?: string;
	}

	// bindowalna wartość liczbowo-logiczna na zewnątrz
	let { value = $bindable<number | null>(null), class: className, ...restProps }: Props = $props();

	// wewnętrzny string dla inputa – pochodna od value
	let internalValue = $derived(value == null ? '' : String(value));

	// efekt: gdy user wpisuje tekst, aktualizujemy `value`
	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const raw = target.value;

		// aktualizujemy tylko internalValue, bo jest bindowane
		internalValue = raw;

		// a teraz liczba na zewnątrz:
		if (raw === '') {
			value = null;
			return;
		}

		const num = Number(raw.replace(',', '.'));
		if (!Number.isNaN(num)) {
			value = num;
		}
		// jeśli nie jest liczbą, zostawiamy poprzednią `value`
	}

	// gdy `value` zmieni się z zewnątrz, `internalValue` zostanie
	// przeliczone automatycznie przez `$derived`
</script>

<input
		type="text"
		bind:value={internalValue}
		on:input={handleInput}
		class={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
    )}
		{...restProps}
/>
