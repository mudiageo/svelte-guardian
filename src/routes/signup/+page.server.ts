import type { Actions } from './$types';
import { PrismaClient } from '@prisma/client';
import { createUser } from '$lib/auth';
const prisma = new PrismaClient();

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		const email = data.get('email');
		const password = data.get('password');

		try {
			const result = await createUser({
				email,
				name,
				role: 'user',
				password
			});

			return result
		} catch (error) {
			console.error('Signup failed:', error);
			throw Error(error)
			return { success: false, error };
		}
		// TODO log the user in
	}
} satisfies Actions;
