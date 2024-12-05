import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle, middleware } from '$lib/auth';

export const handle = sequence(authHandle, middleware);
