import type { PrismaClient } from '@prisma/client'

// Comprehensive database provider types
export type DatabaseProviderType =
	| 'prisma'
	| 'drizzle'
	| 'mongodb'
	| 'postgres'
	| 'mysql'
	| 'sqlite'
	| 'supabase'
	| 'custom';

// Abstract database configuration interface
export interface BaseDatabaseConfig {
	type: DatabaseProviderType;
	connectionString?: string;
	ssl?: boolean;
}

// Specific database provider configurations
export interface CustomAdapterConfig extends BaseDatabaseConfig {
	type: 'custom';
	adapter: Adapter;
}
export interface PrismaConfig extends BaseDatabaseConfig {
	type: 'prisma';
	client: PrismaClient;
}

export interface DrizzleConfig extends BaseDatabaseConfig {
	type: 'drizzle';
	client: any;
	schema?: any;
}

// Union type for all database configurations
export type DatabaseConfig =
	| PrismaConfig
	| DrizzleConfig
	| CustomAdapterConfig;