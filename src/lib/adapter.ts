import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db'

export const getAdapter = (database = "prisma") => {
  if (database === "prisma") {
    const adapter = PrismaAdapter(prisma);
    return adapter
  }
  else { 
    console.error("Unsupported Database in config")
    return {}
  }
} 