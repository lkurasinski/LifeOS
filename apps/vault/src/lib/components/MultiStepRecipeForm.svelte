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
	import * as Select from '$lib/components/ui/select';
	import IngredientSelect from '$lib/components/ui/ingredient-select/IngredientSelect.svelte';
	import { InputNumber } from '$lib/components/ui/input-number';

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

	let currentStep = $state(1);
	let stepHistory = $state([1]);
	let currentStepErrors = $state<string[]>([]);

	let titlePlValue = $state('');
	let selectedFood = $state<FoodOption | null>(null);
	let ingredientAmount = $state(0);
	let ingredientUnit = $state<RecipeIngredient['unit']>('gram');
	let ingredientNotes = $state('');
	let ingredients = $state<RecipeIngredient[]>([]);

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
				break;
			case 3:
				if (selectedFood) {
					const newIngredient: RecipeIngredient = {
						foodName: selectedFood.name_en,
						foodId: selectedFood.id,
						amount: ingredientAmount || 0,
						unit: ingredientUnit,
						notes: ingredientNotes || undefined
					};
					ingredients = [...ingredients, newIngredient];
					$form.ingredients = ingredients;
				}
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

		stepHistory = [...stepHistory, currentStep + 1];
		currentStep = currentStep + 1;
		currentStepErrors = [];
	}

	function goBack() {
		if (stepHistory.length <= 1) return;

		const newHistory = stepHistory.slice(0, -1);
		const previousStep = newHistory[newHistory.length - 1];

		stepHistory = newHistory;
		currentStep = previousStep;
		currentStepErrors = [];
	}

	function addAnotherIngredient() {
		saveCurrentStepData();

		selectedFood = null;
		ingredientAmount = 0;
		ingredientUnit = 'gram';
		ingredientNotes = '';

		stepHistory = [...stepHistory, 2];
		currentStep = 2;
		currentStepErrors = [];
	}

	function removeIngredient(index: number) {
		ingredients = ingredients.filter((_, i) => i !== index);
		$form.ingredients = ingredients;
	}

	async function finishAddingIngredients() {
		if (selectedFood) {
			saveCurrentStepData();
		}

		if (ingredients.length === 0) {
			toast.error('Please add at least one ingredient');
			return;
		}

		await handleSubmit();
	}

	async function handleSubmit() {
		$submitting = true;

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
		currentStep = 1;
		stepHistory = [1];
		currentStepErrors = [];
		titlePlValue = '';
		selectedFood = null;
		ingredientAmount = 0;
		ingredientUnit = 'gram';
		ingredientNotes = '';
		ingredients = [];
		$form = initialData;
	}

	function handleKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
			event.preventDefault();
			if (currentStep === 3) {
				finishAddingIngredients();
			} else {
				goToNextStep();
			}
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			if (currentStep > 1) {
				goBack();
			} else {
				open = false;
				resetForm();
			}
		}
	}
</script>

<Drawer.Root bind:open>
	<Drawer.Content class="max-h-[90vh]" onkeydown={handleKeydown}>
		<div class="mx-auto w-full max-w-3xl">
			<Drawer.Header>
				<Drawer.Title>
					{#if currentStep === 1}
						Recipe Title
					{:else if currentStep === 2}
						Select Ingredient
					{:else}
						Ingredient Details
					{/if}
				</Drawer.Title>
				<Drawer.Description>
					Step {currentStep} of 3
					{#if ingredients.length > 0}
						• {ingredients.length} ingredient{ingredients.length > 1 ? 's' : ''} added
					{/if}
				</Drawer.Description>
			</Drawer.Header>

			<form
				class="px-4 pb-4 overflow-y-auto max-h-[calc(90vh-200px)]"
				onsubmit={(e) => {
					e.preventDefault();
				}}
			>
				{#if currentStepErrors.length > 0}
					<div class="mb-4 space-y-1 p-3 border border-destructive/50 rounded-lg bg-destructive/10">
						{#each currentStepErrors as error}
							<p class="text-sm text-destructive">{error}</p>
						{/each}
					</div>
				{/if}

				{#if currentStep === 1}
					<div class="space-y-2">
						<Label for="titlePl">Recipe Title (Polish) *</Label>
						<Input
							id="titlePl"
							type="text"
							bind:value={titlePlValue}
							placeholder="Nazwa przepisu"
							autofocus
						/>
					</div>
				{/if}

				{#if currentStep === 2}
					<div class="space-y-2">
						<Label>Select Ingredient *</Label>
						<IngredientSelect
							on:select={(e) => {
								selectedFood = e.detail;
								goToNextStep();
							}}
							placeholder="Search for food..."
						/>
						{#if selectedFood}
							<p class="text-sm text-muted-foreground">
								Selected: {selectedFood.name_pl ?? selectedFood.name_en}
							</p>
						{/if}
						<div class="space-y-8"></div>
					</div>
				{/if}

				{#if currentStep === 3}
					<div class="space-y-4">
						<div class="grid gap-3 sm:grid-cols-3">
							<div class="space-y-2">
								<Label for="amount">Amount</Label>
								<InputNumber
									id="amount"
									min="0"
									step="0.1"
									bind:value={ingredientAmount}
									placeholder="100"
								/>
							</div>

							<div class="space-y-2">
								<Label for="unit">Unit</Label>
								<Select.Root type="single" name="unit" bind:value={ingredientUnit}>
									<Select.Trigger class="w-full">
										{ingredientUnit === 'gram' ? 'Grams (g)' : 'Milliliters (ml)'}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Label>Unit</Select.Label>
											<Select.Item value="gram" label="Grams (g)">Grams (g)</Select.Item>
											<Select.Item value="ml" label="Milliliters (ml)">
												Milliliters (ml)
											</Select.Item>
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</div>

							<div class="space-y-2">
								<Label for="notes">Notes</Label>
								<Input
									id="notes"
									type="text"
									bind:value={ingredientNotes}
									placeholder="e.g., diced"
								/>
							</div>
						</div>

						{#if ingredients.length > 0}
							<div class="space-y-2">
								<h4 class="text-sm font-semibold">Added Ingredients</h4>
								{#each ingredients as ingredient, index}
									<div
										class="flex items-center justify-between p-3 border rounded-lg bg-background"
									>
										<div class="flex-1">
											<p class="font-medium">Ingredient #{index + 1}</p>
											<p class="text-sm text-muted-foreground">
												{ingredient.amount}
												{ingredient.unit}
												{#if ingredient.notes}• {ingredient.notes}{/if}
											</p>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onclick={() => removeIngredient(index)}
										>
											Remove
										</Button>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</form>

			<Drawer.Footer class="flex gap-2">
				{#if currentStep > 1}
					<Button type="button" variant="outline" onclick={goBack}>Back</Button>
				{/if}

				{#if currentStep === 3}
					<Button type="button" variant="secondary" onclick={addAnotherIngredient} class="flex-1">
						Add Another Ingredient
					</Button>
					<Button
						type="button"
						onclick={finishAddingIngredients}
						disabled={$submitting}
						class="flex-1"
					>
						{$submitting ? 'Creating...' : 'Finish & Create Recipe'}
					</Button>
				{:else}
					<Button type="button" onclick={goToNextStep} class="flex-1">Next</Button>
				{/if}

				<Button
					variant="outline"
					onclick={() => {
						open = false;
						resetForm();
					}}
				>
					Cancel
				</Button>
			</Drawer.Footer>

			<p class="px-4 pb-2 text-xs text-muted-foreground text-center">
				Press Cmd/Ctrl + Enter to {currentStep === 3 ? 'finish' : 'continue'}
			</p>
		</div>
	</Drawer.Content>
</Drawer.Root>
