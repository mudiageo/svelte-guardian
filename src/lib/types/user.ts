import type { AdapterUser } from '@auth/core/adapters';

export interface User extends AdapterUser {
	role?: string;
}
