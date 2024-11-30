import type { Actions } from './$types';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '$lib'
const prisma = new PrismaClient();

export const actions = {
	default: async ({request}) => {
	  console.log("hey")
	  const data = await request.formData();
		const name = data.get('name');
		const email = data.get('email');
		const password = data.get('password');

	

	try {
		const hashedPassword = await hashPassword(password);
		
		const user = await prisma.user.create({
			data: {
				email,
				name,
				role:"user",
				password: hashedPassword
			}
		});
		
		return { success: true, user: { id: user.id, email: user.email, name: user.name } }
		
	} catch (error) {
		console.error('Signup failed:', error);
		return {success : false} 
}
		// TODO log the user in
	}
} satisfies Actions;

 