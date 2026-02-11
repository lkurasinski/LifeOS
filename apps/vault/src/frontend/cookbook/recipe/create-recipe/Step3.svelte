<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION } from '$frontend/common/constants/ui';
	import type { RecipeInstruction } from '$frontend/cookbook/recipe/recipe.schema';
	import MarkdownEditor from '$frontend/common/components/markdown-editor/MarkdownEditor.svelte';
	import { Button } from '$frontend/common/components/button';
	import { Label } from '$frontend/common/components/label';
	import { Input } from '$frontend/common/components/input';

	let {
		instructions = $bindable<RecipeInstruction[]>([]),
		onFinish
	}: {
		instructions?: RecipeInstruction[];
		onFinish?: () => void;
	} = $props();

	function addInstruction() {
		const newStep: RecipeInstruction = {
			stepNumber: instructions.length + 1,
			titlePl: '',
			titleEn: '',
			descriptionPl: '',
			descriptionEn: ''
		};
		instructions = [...instructions, newStep];
	}

	function removeInstruction(index: number) {
		instructions = instructions.filter((_, i) => i !== index);
		// Renumber remaining steps
		instructions = instructions.map((inst, i) => ({ ...inst, stepNumber: i + 1 }));
	}

	function moveInstructionUp(index: number) {
		if (index === 0) return;
		const newInstructions = [...instructions];
		[newInstructions[index - 1], newInstructions[index]] = [
			newInstructions[index],
			newInstructions[index - 1]
		];
		// Renumber
		instructions = newInstructions.map((inst, i) => ({ ...inst, stepNumber: i + 1 }));
	}

	function moveInstructionDown(index: number) {
		if (index === instructions.length - 1) return;
		const newInstructions = [...instructions];
		[newInstructions[index], newInstructions[index + 1]] = [
			newInstructions[index + 1],
			newInstructions[index]
		];
		// Renumber
		instructions = newInstructions.map((inst, i) => ({ ...inst, stepNumber: i + 1 }));
	}

	function updateInstruction(index: number, field: keyof RecipeInstruction, value: any) {
		instructions = instructions.map((inst, i) =>
			i === index ? { ...inst, [field]: value } : inst
		);
	}

	function handleFinish() {
		onFinish?.();
	}

	// Auto-add first instruction on mount if empty
	$effect(() => {
		if (instructions.length === 0) {
			addInstruction();
		}
	});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">Add step-by-step instructions for your recipe</p>
		<Button type="button" variant="outline" size="sm" onclick={addInstruction}>+ Add Step</Button>
	</div>

	{#if instructions.length > 0}
		<div class="space-y-4">
			{#each instructions as instruction, index (instruction.stepNumber)}
				<div
					class="p-4 border rounded-lg bg-background space-y-3"
					in:fly={{
						x: -20,
						duration: ANIMATION.DURATION.NORMAL,
						delay: index * ANIMATION.STAGGER_DELAY,
						easing: cubicOut
					}}
					out:scale={{ duration: ANIMATION.DURATION.FAST, easing: cubicOut }}
				>
					<div class="flex items-center justify-between">
						<h4 class="text-sm font-semibold">Step {instruction.stepNumber}</h4>
						<div class="flex items-center gap-2">
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class="h-8 w-8"
								onclick={() => moveInstructionUp(index)}
								disabled={index === 0}
								title="Move up"
							>
								↑
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class="h-8 w-8"
								onclick={() => moveInstructionDown(index)}
								disabled={index === instructions.length - 1}
								title="Move down"
							>
								↓
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onclick={() => removeInstruction(index)}
								disabled={instructions.length === 1}
							>
								Remove
							</Button>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="title-pl-{index}">Tytuł</Label>
						<Input
							id="title-pl-{index}"
							type="text"
							value={instruction.titlePl || ''}
							oninput={(e) => updateInstruction(index, 'titlePl', e.currentTarget.value)}
							placeholder="Optional title for this step"
						/>
					</div>

					<MarkdownEditor
						bind:value={instruction.descriptionPl}
						label="Opis"
						placeholder="Describe this step..."
						rows={6}
					/>
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex gap-2">
		<Button type="button" variant="outline" onclick={addInstruction} class="flex-1">
			+ Add Another Step
		</Button>
		<Button
			type="button"
			onclick={handleFinish}
			class="flex-1"
			disabled={instructions.length === 0}
		>
			Finish & Create Recipe
		</Button>
	</div>
</div>
