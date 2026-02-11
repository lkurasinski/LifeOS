/**
 * API Client
 *
 * Reusable fetch utilities for TanStack Query
 */

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public data?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

/**
 * Fetches JSON from the API with error handling
 */
export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
	const response = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			...options?.headers
		},
		...options
	});

	if (!response.ok) {
		const data = await response.json().catch(() => null);
		throw new ApiError(
			data?.error || `HTTP ${response.status}: ${response.statusText}`,
			response.status,
			data
		);
	}

	return await response.json();
}

/**
 * POST request helper
 */
export async function postJson<T>(url: string, body: unknown): Promise<T> {
	return fetchJson<T>(url, {
		method: 'POST',
		body: JSON.stringify(body)
	});
}

/**
 * PUT request helper
 */
export async function putJson<T>(url: string, body: unknown): Promise<T> {
	return fetchJson<T>(url, {
		method: 'PUT',
		body: JSON.stringify(body)
	});
}

/**
 * DELETE request helper
 */
export async function deleteJson<T>(url: string): Promise<T> {
	return fetchJson<T>(url, {
		method: 'DELETE'
	});
}
