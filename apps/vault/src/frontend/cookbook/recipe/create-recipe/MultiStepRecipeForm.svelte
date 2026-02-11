<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import {
		recipeFormSchema,
		type RecipeFormSchema,
		type RecipeIngredient,
		type RecipeInstruction
	} from '$frontend/cookbook/recipe/recipe.schema';
	import * as Drawer from '$lib/components/drawer';
	import { Button } from '$lib/components/button';
	import { Input } from '$lib/components/input';
	import { Label } from '$lib/components/label';
	import Step2 from './Step2.svelte';
	import Step3 from './Step3.svelte';
	import { fly, slide, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { useSearchParams } from 'runed/kit';
	import { browser } from '$app/environment';
	import { z } from 'zod';
	import { API_ROUTES } from '$lib/api/api-routes';

	let { open = $bindable(false), onSuccess }: { open?: boolean; onSuccess?: () => void } = $props();

	const initialData: RecipeFormSchema = {
		namePl: '',
		nameEn: '',
		descriptionPl: '',
		descriptionEn: '',
		servings: 1,
		prepTimeMinutes: undefined,
		cookTimeMinutes: undefined,
		difficulty: undefined,
		isPublic: true,
		imageUrl: '',
		ingredients: [],
		instructions: [],
		mealType: [],
		tags: []
	};

	const { form, errors, enhance } = superForm(initialData, {
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
	let namePlValue = $state('');
	let ingredients = $state<RecipeIngredient[]>([]);
	let instructions = $state<RecipeInstruction[]>([]);

	const currentStep = $derived.by(() => {
		if (!open || !searchParams) return 1;
		return searchParams.step;
	});

	const stepTitle = $derived.by(() => {
		switch (currentStep) {
			case 1:
				return 'Recipe Title';
			case 2:
				return `${namePlValue}: Add Ingredients`;
			case 3:
				return `${namePlValue}: Add Instructions`;
			default:
				return 'Recipe Form';
		}
	});

	const ingredientCountText = $derived(
		ingredients.length > 0
			? `• ${ingredients.length} ingredient${ingredients.length > 1 ? 's' : ''} added`
			: ''
	);

	const showBackButton = $derived(currentStep > 1);
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
				if (!namePlValue.trim()) {
					errors.push('Title is required');
				}
				if (namePlValue.length > 200) {
					errors.push('Title is too long (max 200 characters)');
				}
				break;
			case 2:
				// Validation happens in Step2
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
				$form.namePl = namePlValue;
				break;
			case 2:
				// Data saved via binding in Step2
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

	function finishAddingIngredients() {
		if (ingredients.length === 0) {
			toast.error('Please add at least one ingredient');
			return;
		}

		// Transform ingredients from UI format (with food object) to API format (with foodId)
		const apiIngredients = ingredients.map((ing) => ({
			foodId: ing.food.id!,
			amount: ing.amount ?? undefined,
			unit: ing.unit,
			notes: ing.notes
		}));

		$form.ingredients = ingredients;
		$form.instructions = instructions;

		// Optimistic update - close drawer immediately
		const formData = {
			...$form,
			ingredients: apiIngredients
		};
		console.log('Submitting recipe with transformed ingredients:', formData);
		resetForm();
		open = false;

		// Show promise-based toast with loading/success/error states
		const submitPromise = fetch(API_ROUTES.RECIPES.CREATE, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(formData)
		}).then(async (response) => {
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to create recipe');
			}
			return response.json();
		});

		toast.promise(submitPromise, {
			loading: 'Creating recipe...',
			success: () => {
				onSuccess?.();
				return 'Recipe created successfully!';
			},
			error: (err) => (err instanceof Error ? err.message : 'An unexpected error occurred')
		});
	}

	function resetForm() {
		currentStepErrors = [];
		namePlValue = '';
		ingredients = [];
		instructions = [];
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
	<Drawer.Content onkeydown={handleKeydown}>
		<div class="mx-auto w-full max-w-3xl flex justify-between flex-col h-screen">
			<div class="">
				<Drawer.Header>
					<Drawer.Title>
						{#key currentStep}
							{stepTitle}
						{/key}
					</Drawer.Title>
					<Drawer.Description>
						{#key currentStep}
							Step {currentStep} of 3
							{ingredientCountText}
						{/key}
					</Drawer.Description>
				</Drawer.Header>

				<form
					class="px-4 pb-4 overflow-y-auto max-h-[calc(90vh-200px)]"
					onsubmit={(e) => {
						e.preventDefault();
					}}
					use:enhance
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
								<Label for="namePl">Recipe Title (Polish) *</Label>
								<Input
									id="namePl"
									type="text"
									bind:value={namePlValue}
									onkeyup={(e) => {
										if (e.code === 'Enter') goToNextStep();
									}}
									placeholder="Nazwa przepisu"
									autofocus
									forceAutofocus
								/>
							</div>
						{/if}

						{#if currentStep === 2}
							<div
								class="space-y-2"
								in:fly={{ x: 20, duration: 400, easing: cubicOut }}
								out:fly={{ x: -20, duration: 300, easing: cubicOut }}
							>
								<Step2 bind:ingredients onNext={goToNextStep} onFinish={finishAddingIngredients} />
							</div>
						{/if}

						{#if currentStep === 3}
							<div
								class="space-y-2"
								in:fly={{ x: 20, duration: 400, easing: cubicOut }}
								out:fly={{ x: -20, duration: 300, easing: cubicOut }}
							>
								<Step3 bind:instructions onFinish={finishAddingIngredients} />
							</div>
						{/if}
					{/key}
				</form>
			</div>

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
