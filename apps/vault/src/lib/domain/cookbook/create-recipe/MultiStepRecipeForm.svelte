<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import {
		recipeFormSchema,
		type RecipeFormSchema,
		type RecipeIngredient
	} from '$lib/schemas/recipe';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Step2 from './Step2.svelte';
	import Step3 from './Step3.svelte';
	import { fly, slide, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { useSearchParams } from 'runed/kit';
	import { browser } from '$app/environment';
	import { z } from 'zod';

	type FoodOption = {
		id: string;
		name_pl?: string;
		name_en: string;
		category?: string;
	};

	let { open = $bindable(false), onSuccess }: { open?: boolean; onSuccess?: () => void } = $props();

	const initialData: RecipeFormSchema = {
		titlePl: '',
		titleEn: '',
		descriptionPl: '',
		descriptionEn: '',
		servings: 1,
		prepTimeMinutes: null,
		cookTimeMinutes: null,
		difficulty: undefined,
		isPublic: false,
		imageUrl: '',
		ingredients: [],
		instructions: [],
		tags: []
	};

	const { form, errors, submitting } = superForm(initialData, {
		validators: zod4(recipeFormSchema),
		dataType: 'json',
		SPA: true,
		validationMethod: 'submit-only'
	});

	const stepParamsSchema = z.object({
		step: z.coerce.number().min(1).max(3).default(1)
	});

	const searchParams = browser ? useSearchParams(stepParamsSchema, { pushHistory: true }) : null;

	let currentStepErrors = $state<string[]>([]);
	let titlePlValue = $state('');
	let selectedFood = $state<FoodOption | null>(null);
	let ingredients = $state<RecipeIngredient[]>([]);

	const currentStep = $derived.by(() => {
		if (!open || !searchParams) return 1;
		return searchParams.step;
	});

	const stepTitle = $derived.by(() => {
		switch (currentStep) {
			case 1:
				return 'Recipe Title';
			case 2:
				return 'Select Ingredient';
			case 3:
				return 'Add Ingredient Details';
			default:
				return 'Recipe Form';
		}
	});

	const ingredientCountText = $derived(
		ingredients.length > 0
			? `• ${ingredients.length} ingredient${ingredients.length > 1 ? 's' : ''} added`
			: ''
	);

	const showBackButton = $derived(currentStep > 1 && currentStep < 3);
	const showNextButton = $derived(currentStep < 3);

	function setStep(step: number) {
		if (!searchParams) return;
		searchParams.step = step;
	}

	function clearStepFromUrl() {
		if (!searchParams) return;
		searchParams.reset();
	}

	function validateCurrentStep(): string[] {
		const errors: string[] = [];

		switch (currentStep) {
			case 1:
				if (!titlePlValue.trim()) {
					errors.push('Title is required');
				}
				if (titlePlValue.length > 200) {
					errors.push('Title is too long (max 200 characters)');
				}
				break;
			case 2:
				if (!selectedFood) {
					errors.push('Please select an ingredient');
				}
				break;
			case 3:
				// Validation happens in Step3
				break;
		}

		return errors;
	}

	function saveCurrentStepData() {
		switch (currentStep) {
			case 1:
				$form.titlePl = titlePlValue;
				break;
			case 2:
				// Data saved via binding
				break;
			case 3:
				// Data saved via binding in Step3
				break;
		}
	}

	function goToNextStep() {
		const errors = validateCurrentStep();
		if (errors.length > 0) {
			currentStepErrors = errors;
			toast.error('Please fix the errors');
			return;
		}

		saveCurrentStepData();
		currentStepErrors = [];
		setStep(currentStep + 1);
	}

	function goBack() {
		if (currentStep <= 1) return;

		currentStepErrors = [];
		history.back();
	}

	function addAnotherIngredient() {
		selectedFood = null;
		currentStepErrors = [];
		setStep(2);
	}

	async function finishAddingIngredients() {
		console.log('dupa');
		if (ingredients.length === 0) {
			toast.error('Please add at least one ingredient');
			return;
		}

		$form.ingredients = ingredients;
		await handleSubmit();
	}

	async function handleSubmit() {
		$submitting = true;

		console.log('submitting...');

		try {
			const response = await fetch('/api/recipes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify($form)
			});

			if (!response.ok) {
				const error = await response.json();
				toast.error(error.error || 'Failed to create recipe');
				return;
			}

			toast.success('Recipe created successfully!');
			resetForm();
			open = false;
			onSuccess?.();
		} catch (error) {
			toast.error('An unexpected error occurred');
			console.error('Recipe creation error:', error);
		} finally {
			$submitting = false;
		}
	}

	function resetForm() {
		currentStepErrors = [];
		titlePlValue = '';
		selectedFood = null;
		ingredients = [];
		$form = initialData;
		clearStepFromUrl();
	}

	$effect(() => {
		if (!open) {
			clearStepFromUrl();
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
			event.preventDefault();
			if (showNextButton) {
				goToNextStep();
			}
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			if (showBackButton) {
				goBack();
			} else if (showNextButton) {
				open = false;
				resetForm();
			}
		}
	}
</script>

<Drawer.Root bind:open onClose={() => resetForm()}>
	<Drawer.Content class="max-h-[90vh]" onkeydown={handleKeydown}>
		<div class="mx-auto w-full max-w-3xl">
			<Drawer.Header>
				<Drawer.Title>
					{#key currentStep}
						<div in:fly={{ y: -10, duration: 300, easing: cubicOut }}>
							{stepTitle}
						</div>
					{/key}
				</Drawer.Title>
				<Drawer.Description>
					{#key currentStep}
						<div in:fade={{ duration: 200 }}>
							Step {currentStep} of 3
							{ingredientCountText}
						</div>
					{/key}
				</Drawer.Description>
			</Drawer.Header>

			<form
				class="px-4 pb-4 overflow-y-auto max-h-[calc(90vh-200px)]"
				onsubmit={(e) => {
					e.preventDefault();
				}}
			>
				{#if currentStepErrors.length > 0}
					<div
						class="mb-4 space-y-1 p-3 border border-destructive/50 rounded-lg bg-destructive/10"
						transition:slide={{ duration: 300, easing: cubicOut }}
					>
						{#each currentStepErrors as error}
							<p class="text-sm text-destructive" in:fly={{ x: -10, duration: 200 }}>{error}</p>
						{/each}
					</div>
				{/if}

				{#key currentStep}
					{#if currentStep === 1}
						<div
							class="space-y-2"
							in:fly={{ x: 20, duration: 400, easing: cubicOut }}
							out:fly={{ x: -20, duration: 300, easing: cubicOut }}
						>
							<Label for="titlePl">Recipe Title (Polish) *</Label>
							<Input
								id="titlePl"
								type="text"
								bind:value={titlePlValue}
								onkeyup={(e) => {
									if (e.code === 'Enter') goToNextStep();
								}}
								placeholder="Nazwa przepisu"
								autofocus
							/>
						</div>
					{/if}

					{#if currentStep === 2}
						<div
							class="space-y-2"
							in:fly={{ x: 20, duration: 400, easing: cubicOut }}
							out:fly={{ x: -20, duration: 300, easing: cubicOut }}
						>
							<Step2 bind:selectedFood {ingredients} onSelect={goToNextStep} />
						</div>
					{/if}

					{#if currentStep === 3}
						<div
							in:fly={{ x: 20, duration: 400, easing: cubicOut }}
							out:fly={{ x: -20, duration: 300, easing: cubicOut }}
						>
							{#if selectedFood}
								<Step3
									{selectedFood}
									bind:ingredients
									submitting={$submitting}
									onAddAnother={addAnotherIngredient}
									onFinish={finishAddingIngredients}
								/>
							{/if}
						</div>
					{/if}
				{/key}
			</form>

			<Drawer.Footer class="flex gap-2">
				{#if showBackButton}
					<div in:fly={{ x: -20, duration: 300, easing: cubicOut }} out:fade={{ duration: 150 }}>
						<Button type="button" variant="outline" onclick={goBack}>Back</Button>
					</div>
				{/if}

				{#key currentStep}
					{#if showNextButton}
						<div
							class="flex-1"
							in:fly={{ y: 10, duration: 300, easing: cubicOut }}
							out:fade={{ duration: 150 }}
						>
							<Button type="button" onclick={goToNextStep} class="w-full">Next</Button>
						</div>
					{/if}
				{/key}

				{#if showNextButton}
					<Button
						variant="outline"
						onclick={() => {
							open = false;
							resetForm();
						}}
					>
						Cancel
					</Button>
				{/if}
			</Drawer.Footer>

			{#if showNextButton}
				{#key currentStep}
					<p
						class="px-4 pb-2 text-xs text-muted-foreground text-center"
						in:fade={{ duration: 200, delay: 100 }}
					>
						Press Cmd/Ctrl + Enter to continue
					</p>
				{/key}
			{/if}
		</div>
	</Drawer.Content>
</Drawer.Root>
