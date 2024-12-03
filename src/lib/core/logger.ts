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
      console.log(`[SVELTE-GUARDIAN][${level.toUpperCase()}][${timestamp}] ${message}`, data || '');
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


export function createLogger (loggerConfig: LoggerConfig) {
  return new GuardianLogger(loggerConfig)
}
interface Destination {
  type: 'console'| 'file' | 'remote';
  file?: string;
  path?: string;
  maxSize?: string;
  maxFiles?: number;
  endpoint?: URL;


}


export interface LoggerConfig {
  enabled?: boolean;
  level?: 'debug' | 'info' | 'warn' | 'error';
  destination?: Destination[];

  };