import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { hashPassword, signJWT } from '$lib/server/auth';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	name: z.string().optional()
});

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const data = registerSchema.parse(body);

		// Check if user already exists
		const existing = await prisma.user.findUnique({
			where: { email: data.email }
		});

		if (existing) {
			return json({ error: 'User with this email already exists' }, { status: 400 });
		}

		// Hash password
		const passwordHash = await hashPassword(data.password);

		// Create user
		const user = await prisma.user.create({
			data: {
				email: data.email,
				passwordHash,
				name: data.name || null
			},
			select: {
				id: true,
				email: true,
				name: true,
				locale: true
			}
		});

		// Generate JWT and set cookie
		const token = signJWT(user.id);
		cookies.set('authToken', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		return json(user);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid data', details: error.issues }, { status: 400 });
		}
		console.error('Registration error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
