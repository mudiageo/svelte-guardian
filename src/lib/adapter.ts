import { createDatabaseAdapter, type DatabaseConfig } from './database';

export const getAdapter = async (config: DatabaseConfig | undefined) => {
	const adapter = await createDatabaseAdapter(config);
	return adapter;
};
