#!/usr/bin/env node

/**
 * Downloads OpenAPI specifications for all configured integrations
 * Usage: node scripts/download-openapi-specs.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = path.join(__dirname, '..', 'openapi.config.json');
const ENV_FILE = path.join(__dirname, '..', '..', '..', '.env');

// Load configuration
const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

// Load environment variables
const env = {};
if (fs.existsSync(ENV_FILE)) {
	const envContent = fs.readFileSync(ENV_FILE, 'utf8');
	envContent.split('\n').forEach((line) => {
		const match = line.match(/^([^#][^=]+)="?([^"\n]+)"?/);
		if (match) {
			env[match[1].trim()] = match[2].trim();
		}
	});
}

async function downloadSpec(integration) {
	console.log(`\n📥 Downloading ${integration.displayName}...`);

	let url = integration.input.url;

	// Add auth if required
	if (integration.input.requiresAuth && integration.input.envVar) {
		const apiKey = process.env[integration.input.envVar] || env[integration.input.envVar];
		if (!apiKey) {
			console.error(`❌ Error: ${integration.input.envVar} not found in environment`);
			return false;
		}
		url += `?api_key=${apiKey}`;
	}

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const spec = await response.json();

		// Ensure output directory exists
		const specPath = path.join(__dirname, '..', integration.output.spec);
		const specDir = path.dirname(specPath);
		if (!fs.existsSync(specDir)) {
			fs.mkdirSync(specDir, { recursive: true });
		}

		// Write spec file
		fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

		console.log(`✓ Downloaded to: ${integration.output.spec}`);
		console.log(`  Endpoints: ${Object.keys(spec.paths || {}).length}`);
		console.log(`  Schemas: ${Object.keys(spec.components?.schemas || {}).length}`);

		// Add .gitignore for generated files
		const generatedDir = path.join(specDir, 'generated');
		const gitignorePath = path.join(specDir, '.gitignore');
		if (!fs.existsSync(gitignorePath)) {
			fs.writeFileSync(
				gitignorePath,
				`# OpenAPI downloaded spec and generated code\nfdc-api-spec.json\ngenerated/\n`
			);
			console.log(`  Created .gitignore`);
		}

		return true;
	} catch (err) {
		console.error(`❌ Failed to download ${integration.name}:`, err.message);
		return false;
	}
}

async function main() {
	console.log('🚀 Downloading OpenAPI specifications...\n');

	const results = await Promise.all(
		config.integrations.map((integration) => downloadSpec(integration))
	);

	const successCount = results.filter(Boolean).length;
	const totalCount = config.integrations.length;

	console.log(`\n✨ Complete: ${successCount}/${totalCount} specs downloaded`);

	if (successCount < totalCount) {
		process.exit(1);
	}
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
