import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	client: 'fetch',
	input: 'src/lib/integrations/fdc/fdc-api-spec.json',
	output: {
		path: 'src/lib/integrations/fdc/generated',
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
