import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('authToken');

	if (token) {
		const payload = verifyJWT(token);

		if (payload) {
			const user = await prisma.user.findUnique({
				where: { id: payload.userId },
				select: { id: true, email: true, name: true, locale: true }
			});

			if (user) {
				event.locals.user = user;
			} else {
				// User no longer exists, clear cookie
				event.cookies.delete('authToken', { path: '/' });
			}
		} else {
			// Invalid token, clear cookie
			event.cookies.delete('authToken', { path: '/' });
		}
	}

	return resolve(event);
};
