import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { verifyPassword, signJWT } from '$lib/server/auth';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string()
});

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const data = loginSchema.parse(body);

		// Find user
		const user = await prisma.user.findUnique({
			where: { email: data.email }
		});

		if (!user) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// Verify password
		const valid = await verifyPassword(data.password, user.passwordHash);

		if (!valid) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// Generate JWT and set cookie
		const token = signJWT(user.id);
		cookies.set('authToken', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		return json({
			id: user.id,
			email: user.email,
			name: user.name,
			locale: user.locale
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid data', details: error.issues }, { status: 400 });
		}
		console.error('Login error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
