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
				ignore: 'pid,hostname',
				singleLine: true,
				messageFormat: '{msg} {if req} → →  {req}{end}{if res}← {res}{end}{if err}✖ {err}{end}'
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
}

export const defaultLoggerConfig: LoggerConfig = {
	logHeaders: ['user-agent', 'content-type', 'accept'],
	logCookies: false,
	logRequestBody: true,
	logResponseBody: true
};