import type { Actions } from './$types';
import { signIn } from '$lib/auth'

export const actions = { default: signIn } satisfies Actions;

 