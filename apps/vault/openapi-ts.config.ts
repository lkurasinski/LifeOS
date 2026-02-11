import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	client: 'fetch',
	input: 'src/backend/cookbook/food/infrastructure/fdc/FoodCatalog/fdc-api-spec.json',
	output: {
		path: 'src/backend/cookbook/food/infrastructure/fdc/FoodCatalog/generated',
		format: 'prettier',
		lint: 'eslint'
	},
	types: {
		enums: 'javascript',
		dates: true
	},
	services: {
		asClass: false
	}
});
