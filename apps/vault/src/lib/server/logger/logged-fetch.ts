import { logger, trimBody, defaultLoggerConfig } from './logger';

export interface LoggedFetchOptions extends RequestInit {
	serviceName?: string;
	maxBodyLength?: number;
}

export async function loggedFetch(
	url: Request | string,
	options: LoggedFetchOptions = {}
): Promise<Response> {
	const startTime = Date.now();
	const requestId = crypto.randomUUID().split('-')[0];
	const serviceName = options.serviceName || 'EXTERNAL';
	const maxBodyLength = options.maxBodyLength ?? defaultLoggerConfig.maxBodyLength ?? 1000;

	const method = options.method || 'GET';
	const urlString = typeof url !== 'string' ? url?.url : url;

	const requestLogger = logger.child({ rid: requestId });

	const requestData: Record<string, any> = {
		type: 'API-EXT',
		service: serviceName
		// url: urlString
	};

	if (options.body) {
		try {
			const body = JSON.parse(options.body as string);
			requestData.body = trimBody(body, maxBodyLength);
		} catch {
			// Not JSON, skip
		}
	}

	requestLogger.info(requestData, `[API-EXT] ⌛ ${method} ${serviceName} ${urlString}`);

	try {
		const response = await fetch(url, options);
		const duration = Date.now() - startTime;
		const { status } = response;

		const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

		const responseData: Record<string, any> = {
			type: 'API-EXT'
			// service: serviceName,
			// status,
			// duration: `${duration}ms`
		};

		try {
			const clonedResponse = response.clone();
			const contentType = response.headers.get('content-type');

			if (contentType?.includes('application/json')) {
				const body = await clonedResponse.json();
				responseData.body = trimBody(body, maxBodyLength);
			}
		} catch {
			// Skip if response body cannot be parsed
		}

		requestLogger[level](
			responseData,
			`[API-EXT] ✅ ${status} ${method} ${serviceName} ${urlString} [${duration}ms]`
		);

		return response;
	} catch (error) {
		const duration = Date.now() - startTime;

		requestLogger.error(
			{
				type: 'API-EXT',
				service: serviceName,
				error: error instanceof Error ? error.message : String(error),
				duration: `${duration}ms`
			},
			`!! [API-EXT] ${method} ${serviceName}`
		);

		throw error;
	}
}
