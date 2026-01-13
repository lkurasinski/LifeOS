<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { untrack } from 'svelte';
	import * as Card from '$lib/components/card';
	import { LAYOUT } from '$lib/constants/ui';
	import { foodDetailFormSchema } from './food-detail-form.schema';
	import type { Food } from '$domains/cookbook/foods';
	import { Button } from '$lib/components/button';
	import { Label } from '$lib/components/label';
	import { Input } from '$lib/components/input';
	import { Badge } from '$lib/components/badge';
	import NutritionDisplay from './NutritionDisplay.svelte';

	let {
		foodDetail,
		loading = false,
		onsubmit,
		onback
	}: {
		foodDetail: Food;
		loading?: boolean;
		onsubmit?: (event: CustomEvent<{ foodData: any }>) => void;
		onback?: () => void;
	} = $props();

	const { form, errors, enhance, submitting } = superForm(
		untrack(() => ({
			namePl: foodDetail.name_pl || '',
			nameEn: foodDetail.name_en,
			category: foodDetail.category || '',
			scientificName: foodDetail.scientificName || ''
		})),
		{
			validators: zod4(foodDetailFormSchema),
			SPA: true,
			onUpdate: ({ form }) => {
				if (form.valid) {
					// Build CreateFoodCommand from domain Food model
					const foodData = {
						name_en: form.data.nameEn,
						name_pl: form.data.namePl || undefined,
						category: form.data.category || undefined,
						scientificName: form.data.scientificName || undefined,
						brand: foodDetail.brand || undefined,
						nutrients: foodDetail.nutrients?.map((nv) => ({
							code: nv.nutrient.code,
							value: nv.value
						})),
						source: foodDetail.source
					};

					onsubmit?.(new CustomEvent('submit', { detail: { foodData } }));
				}
			}
		}
	);
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold">Review and Edit Product</h3>
		<Button variant="outline" size="sm" onclick={() => onback?.()}>← Back to Results</Button>
	</div>

	<form method="POST" use:enhance class="space-y-4">
		<div
			class="overflow-y-scroll gap-4 flex flex-col"
			style="max-height: {LAYOUT.MODAL_MAX_HEIGHT}"
		>
			<Card.Root>
				<Card.Header>
					<Card.Title>Product Information</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="name-en">Name (English)</Label>
							<Input
								id="name-en"
								name="nameEn"
								bind:value={$form.nameEn}
								placeholder="English name"
								aria-invalid={$errors.nameEn ? 'true' : undefined}
							/>
							{#if $errors.nameEn}
								<p class="text-sm text-destructive">{$errors.nameEn}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="name-pl">Name (Polish)</Label>
							<Input
								id="name-pl"
								name="namePl"
								bind:value={$form.namePl}
								placeholder="Polish name (optional)"
								aria-invalid={$errors.namePl ? 'true' : undefined}
							/>
							{#if $errors.namePl}
								<p class="text-sm text-destructive">{$errors.namePl}</p>
							{/if}
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="category">Category</Label>
							<Input
								id="category"
								name="category"
								bind:value={$form.category}
								placeholder="Food category (optional)"
								aria-invalid={$errors.category ? 'true' : undefined}
							/>
							{#if $errors.category}
								<p class="text-sm text-destructive">{$errors.category}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="scientific">Scientific Name</Label>
							<Input
								id="scientific"
								name="scientificName"
								bind:value={$form.scientificName}
								placeholder="Scientific name (optional)"
								aria-invalid={$errors.scientificName ? 'true' : undefined}
							/>
							{#if $errors.scientificName}
								<p class="text-sm text-destructive">{$errors.scientificName}</p>
							{/if}
						</div>
					</div>

					{#if foodDetail.brand}
						<div class="space-y-2">
							<Label>Brand</Label>
							<div class="text-sm text-muted-foreground">{foodDetail.brand}</div>
						</div>
					{/if}

					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						<Badge variant="outline">
							{foodDetail.source?.provider === 'fdc' ? 'USDA FDC' : 'Open Food Facts'}
						</Badge>
						{#if foodDetail.source?.externalId}
							<span>Source ID: {foodDetail.source.externalId}</span>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>

			<NutritionDisplay food={foodDetail} />
		</div>

		<div class="flex justify-end gap-2 fixed sticky">
			<Button
				type="button"
				variant="outline"
				onclick={() => onback?.()}
				disabled={$submitting || loading}
			>
				Cancel
			</Button>
			<Button type="submit" disabled={$submitting || loading}>
				{$submitting || loading ? 'Adding...' : 'Add Product'}
			</Button>
		</div>
	</form>
</div>
