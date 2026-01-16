import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
	level: process.env.LOG_LEVEL || 'info',
	...(isDev && {
		transport: {
			target: 'pino-pretty',
			options: {
				useLevelLabels: true,
				colorize: true,
				translateTime: 'HH:MM:ss.l',
				ignore: 'pid,hostname,type',
				singleLine: true,
				messageFormat: '{msg} {if req} → {req}{end} {if res}← {res}{end}{if err}✖ {err}{end}',
				customColors: {
					default: 'red',
					60: 'bgRed',
					50: 'red',
					40: 'yellow',
					30: 'green',
					20: 'blue',
					10: 'red',
					message: 'blueBright',
					greyMessage: '\x1b[95m'
				}
			}
		}
	})
});

export type Logger = typeof logger;

export interface LoggerConfig {
	logHeaders?: string[];
	logCookies?: boolean;
	logRequestBody?: boolean;
	logResponseBody?: boolean;
	maxBodyLength?: number;
}

export const defaultLoggerConfig: LoggerConfig = {
	logHeaders: ['user-agent', 'content-type', 'accept'],
	logCookies: false,
	logRequestBody: true,
	logResponseBody: true,
	maxBodyLength: 10000
};

export function trimBody(body: any, maxLength: number = 1000): any {
	const jsonString = JSON.stringify(body);
	if (jsonString.length <= maxLength) {
		return body;
	}
	const trimmed = jsonString.substring(0, maxLength);
	return `${trimmed}... [truncated, total length: ${jsonString.length}]`;
}
