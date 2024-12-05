import type { Actions } from './$types';
import { PrismaClient } from '@prisma/client';
import { createUser } from '$lib/auth';
const prisma = new PrismaClient();

export const actions = {
	default: async ({ request }) => {
		console.log('hey');
		const data = await request.formData();
		const name = data.get('name');
		const email = data.get('email');
		const password = data.get('password');

		try {
			const user = await createUser({
				email,
				name,
				role: 'user',
				password
			});

			return { success: true, user: { id: user.id, email: user.email, name: user.name } };
		} catch (error) {
			console.error('Signup failed:', error);
			return { success: false };
		}
		// TODO log the user in
	}
} satisfies Actions;
