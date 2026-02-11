import type { Handle } from '@sveltejs/kit';
import { logger, defaultLoggerConfig, trimBody, type LoggerConfig } from './logger';

const config: LoggerConfig = {
	...defaultLoggerConfig,
	// logHeaders: ['user-agent', 'content-type', 'authorization'],
	logHeaders: [],
	logCookies: false,
	logRequestBody: true
};

async function parseRequestBody(request: Request): Promise<any> {
	try {
		const clonedRequest = request.clone();
		const contentType = request.headers.get('content-type');

		if (contentType?.includes('application/json')) {
			return await clonedRequest.json();
		} else if (contentType?.includes('application/x-www-form-urlencoded')) {
			const formData = await clonedRequest.formData();
			return Object.fromEntries(formData);
		}
	} catch {
		return undefined;
	}
}

function getHeaders(request: Request, headerNames: string[]): Record<string, string> {
	const headers: Record<string, string> = {};
	for (const name of headerNames) {
		const value = request.headers.get(name);
		if (value) headers[name] = value;
	}
	return headers;
}

function getResourceType(path: string): string {
	if (path.startsWith('/api/')) {
		return 'API-INT';
	}
	return 'PAGE';
}

export const loggerHandle: Handle = async ({ event, resolve }) => {
	const startTime = Date.now();
	const requestId = crypto.randomUUID().split('-')[0];

	const requestLogger = logger.child({ rid: requestId });
	event.locals.logger = requestLogger;

	const { method, url } = event.request;
	const path = event.url.pathname;
	const params = Object.fromEntries(event.url.searchParams);
	const hasParams = Object.keys(params).length > 0;

	const resourceType = getResourceType(path);

	const requestData: Record<string, any> = {
		type: resourceType
	};

	if (hasParams) requestData.params = params;

	if (config.logHeaders && config.logHeaders.length > 0) {
		const headers = getHeaders(event.request, config.logHeaders);
		if (Object.keys(headers).length > 0) requestData.headers = headers;
	}

	if (config.logCookies) {
		const cookies = event.cookies.getAll();
		if (cookies.length > 0) requestData.cookies = cookies;
	}

	if (config.logRequestBody && method !== 'GET' && method !== 'HEAD') {
		const body = await parseRequestBody(event.request);
		if (body) requestData.body = trimBody(body, config.maxBodyLength);
	}

	requestLogger.info(requestData, `[${resourceType}] ⌛ ${method} ${path}`);

	try {
		const response = await resolve(event);
		const duration = Date.now() - startTime;
		const { status } = response;

		const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

		const responseData: Record<string, any> = {
			// type: resourceType,
			// duration: `${duration}ms`
		};

		if (config.logResponseBody && resourceType === 'API-INT') {
			try {
				const clonedResponse = response.clone();
				const contentType = response.headers.get('content-type');

				if (contentType?.includes('application/json')) {
					const body = await clonedResponse.json();
					responseData.body = trimBody(body, config.maxBodyLength);
				}
			} catch {
				// Skip if response body cannot be parsed
			}
		}

		requestLogger[level](
			responseData,
			`[${resourceType}] ✅ ${status} ${method} ${path} [${duration}ms]`
		);

		return response;
	} catch (error) {
		const duration = Date.now() - startTime;

		requestLogger.error(
			{
				type: resourceType,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				duration: `${duration}ms`
			},
			`!! [${resourceType}] ${method} ${path}`
		);

		throw error;
	}
};
