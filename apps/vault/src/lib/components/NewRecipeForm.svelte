<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import {
		recipeFormSchema,
		type RecipeFormSchema,
		type RecipeIngredient,
		type RecipeInstruction
	} from '$lib/schemas/recipe';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Select from '$lib/components/ui/select';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as ButtonGroup from '$lib/components/ui/button-group';
	import IngredientSelect from '$lib/components/ui/ingredient-select/IngredientSelect.svelte';
	import { InputNumber } from '$lib/components/ui/input-number';

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
		isPublic: false,
		imageUrl: '',
		ingredients: [],
		instructions: [],
		tags: []
	};

	const { form, errors, allErrors, validate, submitting } = superForm(initialData, {
		validators: zod4(recipeFormSchema),
		dataType: 'json',
		SPA: true,
		validationMethod: 'submit-only'
	});

	let selectedFood: { id: string; name_pl?: string; name_en: string } | null = $state(null);
	let ingredientName = $state('');
	let ingredientAmount = $state(0);
	let ingredientUnit = $state<RecipeIngredient['unit']>('gram');
	let ingredientNotes = $state('');

	let instructionText = $state('');

	function addIngredient() {
		if (!selectedFood || ingredientAmount <= 0) {
			toast.error('Please select a food and enter a valid amount');
			return;
		}

		const newIngredient: RecipeIngredient = {
			foodId: selectedFood.id,
			foodName: selectedFood.name_en,
			amount: ingredientAmount,
			unit: ingredientUnit,
			notes: ingredientNotes || undefined
		};

		$form.ingredients = [...$form.ingredients, newIngredient];

		selectedFood = null;
		ingredientName = '';
		ingredientAmount = 0;
		ingredientUnit = 'gram';
		ingredientNotes = '';
	}

	function removeIngredient(index: number) {
		$form.ingredients = $form.ingredients.filter((_, i) => i !== index);
	}

	function addInstruction() {
		if (!instructionText.trim()) {
			toast.error('Please enter instruction text');
			return;
		}

		const newInstruction: RecipeInstruction = {
			stepNumber: $form.instructions.length + 1,
			textPl: instructionText.trim(),
			textEn: undefined
		};

		$form.instructions = [...$form.instructions, newInstruction];
		instructionText = '';
	}

	function removeInstruction(index: number) {
		$form.instructions = $form.instructions
			.filter((_, i) => i !== index)
			.map((inst, idx) => ({
				...inst,
				stepNumber: idx + 1
			}));
	}

	function moveInstructionUp(index: number) {
		if (index === 0) return;
		const newInstructions = [...$form.instructions];
		[newInstructions[index - 1], newInstructions[index]] = [
			newInstructions[index],
			newInstructions[index - 1]
		];
		$form.instructions = newInstructions.map((inst, idx) => ({ ...inst, stepNumber: idx + 1 }));
	}

	function moveInstructionDown(index: number) {
		if (index === $form.instructions.length - 1) return;
		const newInstructions = [...$form.instructions];
		[newInstructions[index], newInstructions[index + 1]] = [
			newInstructions[index + 1],
			newInstructions[index]
		];
		$form.instructions = newInstructions.map((inst, idx) => ({ ...inst, stepNumber: idx + 1 }));
	}

	async function handleSubmit() {
		const hasErrors = $allErrors.length > 0;

		if (hasErrors) {
			toast.error('Please fix the errors in the form');
			return;
		}

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

			const result = await response.json();
			toast.success('Recipe created successfully!');

			$form = initialData;

			open = false;
			onSuccess?.();
		} catch (error) {
			toast.error('An unexpected error occurred');
			console.error('Recipe creation error:', error);
		} finally {
			$submitting = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<Drawer.Root bind:open>
	<Drawer.Content class="max-h-[90vh]">
		<div class="mx-auto w-full max-w-3xl">
			<Drawer.Header>
				<Drawer.Title>Create New Recipe</Drawer.Title>
				<Drawer.Description>Add a new recipe to your cookbook</Drawer.Description>
			</Drawer.Header>

			<form
				class="px-4 pb-4 overflow-y-auto max-h-[calc(90vh-200px)]"
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<div class="space-y-6">
					<!-- Basic Information -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Basic Information</h3>

						<div class="grid gap-4 sm:grid-cols-2">
							<div class="space-y-2">
								<Label for="namePl">Title (Polish) *</Label>
								<Input
									id="namePl"
									type="text"
									bind:value={$form.namePl}
									placeholder="Nazwa przepisu"
									aria-invalid={$errors.namePl ? 'true' : undefined}
								/>
								{#if $errors.namePl}
									<p class="text-sm text-destructive">{$errors.namePl}</p>
								{/if}
							</div>

							<div class="space-y-2">
								<Label for="nameEn">Title (English)</Label>
								<Input
									id="nameEn"
									type="text"
									bind:value={$form.nameEn}
									placeholder="Recipe name"
								/>
							</div>
						</div>

						<div class="grid gap-4 sm:grid-cols-3">
							<div class="space-y-2">
								<Label for="servings">Servings *</Label>
								<InputNumber
									id="servings"
									min="1"
									bind:value={$form.servings}
									aria-invalid={$errors.servings ? 'true' : undefined}
								/>
								{#if $errors.servings}
									<p class="text-sm text-destructive">{$errors.servings}</p>
								{/if}
							</div>

							<div class="space-y-2">
								<Label for="prepTime">Prep Time (min)</Label>
								<InputNumber id="prepTime" min="0" bind:value={$form.prepTimeMinutes} />
							</div>

							<div class="space-y-2">
								<Label for="cookTime">Cook Time (min)</Label>
								<InputNumber id="cookTime" min="0" bind:value={$form.prepTimeMinutes} />
							</div>
						</div>

						<div class="space-y-2">
							<Label for="difficulty">Difficulty</Label>
							<select
								id="difficulty"
								bind:value={$form.difficulty}
								class="w-full rounded-md border border-input bg-background px-3 py-2"
							>
								<option value={undefined}>Select difficulty</option>
								<option value="easy">Easy</option>
								<option value="medium">Medium</option>
								<option value="hard">Hard</option>
							</select>
						</div>

						<div class="space-y-2">
							<Label for="descriptionPl">Description (Polish)</Label>
							<textarea
								id="descriptionPl"
								bind:value={$form.descriptionPl}
								rows="3"
								class="w-full rounded-md border border-input bg-background px-3 py-2"
								placeholder="Krótki opis przepisu"
							></textarea>
						</div>
					</div>

					<!-- Ingredients Section -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Ingredients *</h3>

						<div class="space-y-3 p-4 border rounded-lg bg-muted/20">
							<div class="space-y-2">
								<Label>Select Ingredient</Label>
								<IngredientSelect
									on:select={(e) => (selectedFood = e.detail)}
									placeholder="Search for food..."
								/>
								{#if selectedFood}
									<p class="text-sm text-muted-foreground">
										Selected: {selectedFood.name_pl ?? selectedFood.name_en}
									</p>
								{/if}
							</div>

							<div class="grid gap-3 sm:grid-cols-4">
								<div class="space-y-2">
									<Label for="amount">Amount *</Label>
									<InputNumber
										id="amount"
										min="0"
										step="0.1"
										bind:value={ingredientAmount}
										placeholder="100"
									/>
								</div>

								<div class="space-y-2">
									<Label for="unit">Unit *</Label>
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

								<Button
									type="button"
									onclick={addIngredient}
									variant="secondary"
									class="w-full sm:col-span-4"
								>
									Add Ingredient
								</Button>
							</div>

							{#if $form.ingredients.length > 0}
								<div class="space-y-2">
									{#each $form.ingredients as ingredient, index}
										<div
											class="flex items-center justify-between p-3 border rounded-lg bg-background"
										>
											<div class="flex-1">
												<p class="font-medium">#{index + 1} #{ingredient.foodName}</p>
												<p class="text-sm text-muted-foreground">
													{ingredient.amount}
													{ingredient.unit}
													{#if ingredient.notes}· {ingredient.notes}{/if}
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

							{#if $errors.ingredients}
								<p class="text-sm text-destructive">{$errors.ingredients}</p>
							{/if}
						</div>

						<!-- Instructions Section -->
						<div class="space-y-4">
							<h3 class="text-lg font-semibold">Instructions *</h3>

							<div class="space-y-3 p-4 border rounded-lg bg-muted/20">
								<div class="space-y-2">
									<Label for="instructionText">Step Description</Label>
									<textarea
										id="instructionText"
										bind:value={instructionText}
										rows="3"
										class="w-full rounded-md border border-input bg-background px-3 py-2"
										placeholder="Describe the step..."
									></textarea>
								</div>

								<Button type="button" onclick={addInstruction} variant="secondary" class="w-full">
									Add Instruction Step
								</Button>
							</div>

							<!--{#if $form.instructions.length > 0}-->
							<!--	<div class="space-y-2">-->
							<!--		{#each $form.instructions as instruction, index}-->
							<!--			<div class="flex items-start gap-2 p-3 border rounded-lg bg-background">-->
							<!--				<span class="font-bold text-muted-foreground min-w-[2rem]">-->
							<!--					{instruction.stepNumber}.-->
							<!--				</span>-->
							<!--				<p class="flex-1">{instruction.textPl}</p>-->
							<!--				<div class="flex gap-1">-->
							<!--					<Button-->
							<!--						type="button"-->
							<!--						variant="ghost"-->
							<!--						size="sm"-->
							<!--						onclick={() => moveInstructionUp(index)}-->
							<!--						disabled={index === 0}-->
							<!--					>-->
							<!--						↑-->
							<!--					</Button>-->
							<!--					<Button-->
							<!--						type="button"-->
							<!--						variant="ghost"-->
							<!--						size="sm"-->
							<!--						onclick={() => moveInstructionDown(index)}-->
							<!--						disabled={index === $form.instructions.length - 1}-->
							<!--					>-->
							<!--						↓-->
							<!--					</Button>-->
							<!--					<Button-->
							<!--						type="button"-->
							<!--						variant="ghost"-->
							<!--						size="sm"-->
							<!--						onclick={() => removeInstruction(index)}-->
							<!--					>-->
							<!--						×-->
							<!--					</Button>-->
							<!--				</div>-->
							<!--			</div>-->
							<!--		{/each}-->
							<!--	</div>-->
							<!--{/if}-->

							{#if $errors.instructions}
								<p class="text-sm text-destructive">{$errors.instructions}</p>
							{/if}
						</div>

						<!-- Additional Options -->
						<div class="space-y-4">
							<h3 class="text-lg font-semibold">Additional Options</h3>

							<div class="flex items-center gap-2">
								<input
									id="isPublic"
									type="checkbox"
									bind:checked={$form.isPublic}
									class="h-4 w-4 rounded border-gray-300"
								/>
								<Label for="isPublic" class="cursor-pointer">Make this recipe public</Label>
							</div>
						</div>
					</div>
				</div>
			</form>

			<Drawer.Footer class="flex gap-2">
				<Button type="button" onclick={handleSubmit} disabled={$submitting} class="flex-1">
					{$submitting ? 'Creating...' : 'Create Recipe'}
				</Button>
				<Button variant="outline" disabled={$submitting} onclick={() => (open = false)}>
					Cancel
				</Button>
			</Drawer.Footer>

			<p class="px-4 pb-2 text-xs text-muted-foreground text-center">
				Press Cmd/Ctrl + Enter to create
			</p>
		</div>
	</Drawer.Content>
</Drawer.Root>
