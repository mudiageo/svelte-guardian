import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle, middleware } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

// Redirect URLs ending in .md 
const mdRedirectHandle = async ({ event, resolve }) => {
	const { url } = event;
	 if (url.pathname.endsWith('.md')) {
		let newPath = url.pathname.slice(0, -3);
		
		newPath = newPath.endsWith('/index') ? newPath.slice(0, -6) : newPath
		
		const redirectUrl = `${newPath}${url.search}${url.hash}`;
		redirect(308, redirectUrl);
	}

	
	return resolve(event);
};

export const handle = sequence(mdRedirectHandle, authHandle, middleware);
