<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { untrack } from 'svelte';
	import Button from '$lib/components/button/Button.svelte';
	import Input from '$lib/components/input/Input.svelte';
	import Label from '$lib/components/label/Label.svelte';
	import Card from '$lib/components/card/card.svelte';
	import CardHeader from '$lib/components/card/card-header.svelte';
	import CardTitle from '$lib/components/card/card-title.svelte';
	import CardContent from '$lib/components/card/card-content.svelte';
	import Separator from '$lib/components/separator/separator.svelte';
	import Badge from '$lib/components/badge/badge.svelte';

	import { foodDetailFormSchema } from './food-detail-form.schema';
	import type { Food } from '$domains/cookbook/foods';

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
						nutrients: foodDetail.nutrients.map((nv) => ({
							code: nv.nutrient.code,
							value: nv.value
						})),
						source: foodDetail.source!
					};

					onsubmit?.(new CustomEvent('submit', { detail: { foodData } }));
				}
			}
		}
	);

	// Group nutrients by category using domain nutrient structure
	const nutrientsByCategory = $derived(
		foodDetail.nutrients.reduce(
			(acc, n) => {
				const code = n.nutrient.code;
				const category = n.nutrient.category || 'Other';

				if (!acc[category]) acc[category] = [];
				acc[category].push(n);
				return acc;
			},
			{} as Record<string, typeof foodDetail.nutrients>
		)
	);
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold">Review and Edit Product</h3>
		<Button variant="outline" size="sm" onclick={() => onback?.()}>← Back to Results</Button>
	</div>

	<form method="POST" use:enhance class="space-y-4">
		<div class="overflow-y-scroll max-h-[calc(85vh-200px)]">
			<Card>
				<CardHeader>
					<CardTitle>Product Information</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Nutritional Information (per 100g)</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						{#each Object.entries(nutrientsByCategory) as [categoryName, nutrients]}
							<div>
								<h4 class="text-sm font-semibold mb-2">{categoryName}</h4>
								<div class="text-right">
									{#each nutrients as { nutrient, value }}
										<p class="text-sm flex justify-end">
											<span class="text-muted-foreground">
												{nutrient.name_pl || nutrient.name_en}:
											</span>
											<span class="ml-1 font-medium w-20">
												{value.toFixed(2)}
												{nutrient.unit}
											</span>
										</p>
									{/each}
								</div>
							</div>
							<Separator />
						{/each}
					</div>
				</CardContent>
			</Card>
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
