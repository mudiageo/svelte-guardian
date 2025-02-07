import type { Actions } from './$types';
import { PrismaClient } from '@prisma/client';
import { createUser, signIn } from '$lib/auth';
import { fail, redirect } from '@sveltejs/kit';
const prisma = new PrismaClient();

export const actions = {
	default: async (event) => {
		const clonedRequest = event.request.clone();

		const data = await clonedRequest.formData();
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

			if (!result.success) return fail(500, { error: result.error });
		} catch (error) {
			console.error('Signup failed:', error);
			throw Error(error);
			return { success: false, error };
		}

		// log the user in
		console.log(await signIn(event));
		console.log('m');
	}
} satisfies Actions;
