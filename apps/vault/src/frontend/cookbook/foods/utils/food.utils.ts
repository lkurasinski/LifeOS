import { NUTRIENTS } from '$backend/cookbook/common/nutrient/nutrient';
import type { FoodDto } from '$contracts/cookbook/food/Food.dto';

export const getBasicNutrientsString = (food: FoodDto) => {
	return `energy: ${getEnergyKcal(food)} kcal 
	· carbs: ${getFoodNutrientAmount(food, NUTRIENTS.CHOCDF_g.code)} g 
	· prot ${getFoodNutrientAmount(food, NUTRIENTS.PROTCNT_g.code)} g 
	· fat ${getFoodNutrientAmount(food, NUTRIENTS.FAT_g.code)} g`;
};

export function getFoodNutrientAmount(food: FoodDto, nutrientCode: string): number | undefined {
	return food.nutrients?.find((nv) => nv.nutrient.code === nutrientCode)?.amount;
}

export const getEnergyKcal = (food: FoodDto): number => {
	return (
		getFoodNutrientAmount(food, NUTRIENTS.ENERC_ASF_kcal.code) ??
		getFoodNutrientAmount(food, NUTRIENTS.ENERC_AGF_kcal.code) ??
		getFoodNutrientAmount(food, NUTRIENTS.ENERA_kcal.code) ??
		0
	);
};
