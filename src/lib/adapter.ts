import { createDatabaseAdapter, type DatabaseConfig } from './database';

export const getAdapter = async (config: DatabaseConfig) => {
	const adapter = await createDatabaseAdapter(config);
	return adapter;
};
