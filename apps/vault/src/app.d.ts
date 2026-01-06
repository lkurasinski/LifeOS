// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Logger } from '$lib/server/logger';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: number;
				email: string;
				name: string | null;
				locale: string;
			};
			logger: Logger;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '$env/static/private' {
	export const FDC_API_KEY: string;
	export const DATABASE_URL: string;
	export const JWT_SECRET: string;
	export const TYPESENSE_HOST: string;
	export const TYPESENSE_PORT: string;
	export const TYPESENSE_PROTOCOL: string;
	export const TYPESENSE_API_KEY: string;
	export const NODE_ENV: string;
	export const PUBLIC_APP_URL: string;
}

export {};
