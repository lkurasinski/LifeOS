import { json } from '@sveltejs/kit';
import z from 'zod';
import * as sea from 'node:sea';
import { ApiError } from '$backend/common/utils/api.utils';

/**
 * Convert URLSearchParams to plain object
 */
export const searchParamsToObject = (
	params: URLSearchParams
): Record<string, string | string[]> => {
	const result: Record<string, string | string[]> = {};

	for (const [key, value] of params.entries()) {
		const existing = result[key];

		// Handle multiple values for same key (e.g., ?tag=a&tag=b)
		if (existing) {
			if (Array.isArray(existing)) {
				existing.push(value);
			} else {
				result[key] = [existing, value];
			}
		} else {
			result[key] = value;
		}
	}

	return result;
};

export const handleRequest = async <T, R>(
	pathParams: Record<string, string>,
	searchParams: URLSearchParams,
	schema: z.ZodSchema<T>,
	handler: (input: T) => Promise<R>
): Promise<Response> => {
	try {
		const input = searchParamsToObject(searchParams);
		const merged = { ...pathParams, ...input };
		const validated = schema.parse(merged);

		const result = await handler(validated);
		return json(result, { status: 200 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
		}

		if (error instanceof ApiError) {
			return json({ error: error.message }, { status: error.status });
		}

		console.error('Request handler error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
