import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db'

export const getAdapter = async (database = "prisma") => {
  if (database === "prisma") {
    return await PrismaAdapter(prisma)
  }
  else { 
    console.error("Unsupported Database in config")
    return {}
  }
} 