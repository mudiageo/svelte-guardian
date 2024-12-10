import type { Adapter } from '@auth/core/adapters';
import { optionalImport } from './utils'

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
	client: any;
}

export interface DrizzleConfig extends BaseDatabaseConfig {
	type: 'drizzle';
	client: any;
	schema?: any;
}

export interface MongoDBConfig extends BaseDatabaseConfig {
	type: 'mongodb';
	client: any;
	database?: string;
}

export interface PostgresConfig extends BaseDatabaseConfig {
	type: 'postgres';
	client: any;
}

export interface MySQLConfig extends BaseDatabaseConfig {
	type: 'mysql';
	client: any;
}

export interface SQLiteConfig extends BaseDatabaseConfig {
	type: 'sqlite';
	client: any;
}

export interface SupabaseConfig extends BaseDatabaseConfig {
	type: 'supabase';
	client: any;
	serviceRole?: string;
}

// Union type for all database configurations
export type DatabaseConfig =
	| PrismaConfig
	| DrizzleConfig
	| MongoDBConfig
	| PostgresConfig
	| MySQLConfig
	| SQLiteConfig
	| SupabaseConfig
	| CustomAdapterConfig;


// Adapter creation utility
export const createDatabaseAdapter = async (config: DatabaseConfig): Promise<Adapter | null> => {
	if (!config) return null;

	switch (config.type) {
		case 'prisma':
			const { PrismaAdapter } = await optionalImport('@auth/prisma-adapter');
			return PrismaAdapter(config.client);
		case 'custom':
			return config.adapter;
		case 'drizzle':
			const { DrizzleAdapter } = await optionalImport('@auth/drizzle-adapter');
			return DrizzleAdapter(config.client, (config as DrizzleConfig).schema);

		case 'mongodb':
			const { MongoDBAdapter } = await optionalImport('@auth/mongodb-adapter');
			return MongoDBAdapter(config.client, {
				databaseName: (config as MongoDBConfig).database
			});

		case 'postgres':
			const { PostgresAdapter } = await optionalImport('@auth/pg-adapter');
			return PostgresAdapter(config.client);

		case 'mysql':
			const { MySQLAdapter } = await optionalImport('@auth/mysql-adapter');
			return MySQLAdapter(config.client);

		case 'sqlite':
			const { SQLiteAdapter } = await optionalImport('@auth/sqlite-adapter');
			return SQLiteAdapter(config.client);

		case 'supabase':
			const { SupabaseAdapter } = await optionalImport('@auth/supabase-adapter');
			return SupabaseAdapter(
				(config as SupabaseConfig).client,
				(config as SupabaseConfig).serviceRole
			);

		default:
			throw new Error(`Unsupported database adapter: ${config.type}`);
	}
};
// TODO Implement Database connection utility

export const getUserByEmail = async (config: DatabaseConfig, email: string) => {
	if (!config) throw new Error('Database configuration is required');

	if (!email) return null;

	let user = {};
	switch (config.type) {
		case 'prisma':
			user = await config.client.user.findUnique({ where: { email } });
			console.log(user);
			return user;

		//For now, user has to supply  getUserByEmail function. Hopefully Auth.js would agree to add it to thr adspter specification
		case 'custom':
			user = await config.getUserByEmail(email);
			console.log(user);
			return user;

		//TODO Implement for these adapters

		// case 'drizzle':

		// case 'mongodb':

		// case 'postgres':

		// case 'mysql':

		// case 'sqlite':

		// case 'supabase':

		default:
			throw new Error(`Unsupported database adapter: ${config.type}`);
	}
};
