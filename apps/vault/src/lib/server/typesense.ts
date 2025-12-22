import Typesense from 'typesense';
import { env } from '$env/dynamic/private';

export const typesense = new Typesense.Client({
    nodes: [
        {
            host: env.TYPESENSE_HOST ?? 'localhost',
            port: Number(env.TYPESENSE_PORT ?? '8108'),
            protocol: env.TYPESENSE_PROTOCOL ?? 'http'
        }
    ],
    apiKey: env.TYPESENSE_SEARCH_KEY ?? env.TYPESENSE_API_KEY ?? '',
    connectionTimeoutSeconds: 2
});
