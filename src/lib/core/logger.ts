class GuardianLogger {
	private config: { enabled: boolean; level: string };

	constructor(config?: { enabled?: boolean; level?: 'debug' | 'info' | 'warn' | 'error' }) {
		this.config = {
			enabled: config?.enabled ?? true,
			level: config?.level ?? 'info'
		};
	}

	private log(level: string, message: string, data?: any) {
		if (!this.config.enabled) return;

		const logLevels = ['debug', 'info', 'warn', 'error'];
		const currentLevelIndex = logLevels.indexOf(this.config.level);
		const messageLevelIndex = logLevels.indexOf(level);

		if (messageLevelIndex >= currentLevelIndex) {
			const timestamp = new Date().toISOString();
			const logPrefix = `[SVELTE-GUARDIAN][${level.toUpperCase()}][${timestamp}] `;
			switch (level) {
				case 'debug':
					console.debug(logPrefix, message, data || '');
					break;
				case 'info':
					console.info(logPrefix, message, data || '');
					break;
				case 'warn':
					console.warn(logPrefix, message, data || '');
					break;
				case 'error':
					console.error(logPrefix, message, data || '');
					break;
				default:
					console.log(logPrefix, message, data || '');
			}
		}
	}

	debug(message: string, data?: any) {
		this.log('debug', message, data);
	}

	info(message: string, data?: any) {
		this.log('info', message, data);
	}

	warn(message: string, data?: any) {
		this.log('warn', message, data);
	}

	error(message: string, data?: any) {
		this.log('error', message, data);
	}
}

export function createLogger(loggerConfig: LoggerConfig | undefined) {
	return new GuardianLogger(loggerConfig);
}
interface Destination {
	type: 'console' | 'file' | 'remote';
	file?: string;
	path?: string;
	maxSize?: string;
	maxFiles?: number;
	endpoint?: URL;
}

export interface LoggerConfig {
	enabled?: boolean;
	level?: 'debug' | 'info' | 'warn' | 'error';
	destinations?: Destination[];
}
