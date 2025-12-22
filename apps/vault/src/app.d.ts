// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Logger } from '$lib/server/logger';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
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

export {};
