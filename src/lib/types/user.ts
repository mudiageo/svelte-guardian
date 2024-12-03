import type { User } from '@prisma/client';

export interface ExtendedUser extends User {
  role?: string
}