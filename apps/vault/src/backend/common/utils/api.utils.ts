/**
 * Generic API Error
 */
export class ApiError extends Error {
	constructor(
		public readonly status: number,
		message: string,
		public readonly serviceName: string,
		public readonly details?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
	constructor(serviceName: string, resourceId?: string) {
		const message = resourceId
			? `Resource ${resourceId} not found in ${serviceName}`
			: `Resource not found in ${serviceName}`;
		super(404, message, serviceName);
		this.name = 'NotFoundError';
	}
}

/**
 * OpenAPI Fetch Response type
 */
type ApiResponse<T> = {
	data?: T;
	error?: unknown;
	response?: Response;
};

/**
 * Error handler options
 */
type HandleApiResponseOptions = {
	serviceName: string;
	notFoundReturnsNull?: boolean; // Czy 404 zwraca null czy rzuca błąd
	resourceId?: string; // ID zasobu (dla lepszych error messages)
};

export const handleApiResponse = <T>(
	response: ApiResponse<T>,
	options: HandleApiResponseOptions
): T | null => {
	const { serviceName, notFoundReturnsNull = true, resourceId } = options;
	const status = response.response?.status;

	// ✅ Success - data exists
	if (response.data !== undefined) {
		return response.data;
	}

	// ✅ 404 - Not Found
	if (status === 404) {
		if (notFoundReturnsNull) {
			return null;
		}
		throw new NotFoundError(serviceName, resourceId);
	}

	// ❌ Client errors (400-499)
	if (status && status >= 400 && status < 500) {
		const message = getClientErrorMessage(status, serviceName);
		throw new ApiError(status, message, serviceName, response.error);
	}

	// ❌ Server errors (500-599)
	if (status && status >= 500) {
		const message = `${serviceName} server error (${status})`;
		throw new ApiError(status, message, serviceName, response.error);
	}

	// ❌ Unknown error (no status or data)
	if (response.error) {
		throw new ApiError(
			status ?? 0,
			`${serviceName} API error: ${JSON.stringify(response.error)}`,
			serviceName,
			response.error
		);
	}

	// ❌ No data and no error (unexpected state)
	throw new ApiError(status ?? 0, `Unexpected ${serviceName} API response`, serviceName);
};

/**
 * Get human-readable error message for client errors
 */
const getClientErrorMessage = (status: number, serviceName: string): string => {
	switch (status) {
		case 400:
			return `Invalid request to ${serviceName}`;
		case 401:
			return `${serviceName} authentication required`;
		case 403:
			return `${serviceName} access forbidden`;
		case 404:
			return `Resource not found in ${serviceName}`;
		case 429:
			return `${serviceName} rate limit exceeded`;
		default:
			return `${serviceName} client error (${status})`;
	}
};

/**
 * Async wrapper that catches and wraps errors
 */
export const handleApiRequest = async <T>(
	request: Promise<ApiResponse<T>>,
	options: HandleApiResponseOptions
): Promise<T | null> => {
	try {
		const response = await request;
		return handleApiResponse(response, options);
	} catch (error) {
		// Network error or other unexpected error
		if (error instanceof ApiError) {
			throw error;
		}

		throw new ApiError(
			0,
			`${options.serviceName} request failed: ${error instanceof Error ? error.message : String(error)}`,
			options.serviceName,
			error
		);
	}
};
