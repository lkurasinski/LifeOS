import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';
import { loggerHandle } from '$lib/server/logger.handle';

const authHandle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('authToken');

	if (token) {
		const payload = verifyJWT(token);

		if (payload) {
			try {
				const user = await prisma.user.findUnique({
					where: { id: payload.userId },
					select: { id: true, email: true, name: true, locale: true }
				});

				if (user) {
					event.locals.user = user;
				} else {
					event.cookies.delete('authToken', { path: '/' });
				}
			} catch (error) {
				// Handle invalid token (e.g., old UUID tokens after migration to int IDs)
				console.warn('Invalid auth token, deleting cookie:', error);
				event.cookies.delete('authToken', { path: '/' });
			}
		} else {
			event.cookies.delete('authToken', { path: '/' });
		}
	}

	return resolve(event);
};

export const handle = sequence(loggerHandle, authHandle);
