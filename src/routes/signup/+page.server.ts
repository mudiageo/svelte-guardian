import type { Actions } from './$types';
import { createUser, signIn } from '$lib/auth';
import { fail } from '@sveltejs/kit';


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
		await signIn(event)
	}
} satisfies Actions;
