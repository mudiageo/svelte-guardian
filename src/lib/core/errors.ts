import { AuthError, CredentialsSignin } from '@auth/core/errors';

export { AuthError, CredentialsSignin };

export class AuthenticationError extends CredentialsSignin {
	constructor(message: string, code: string = 'authentication_error') {
		super(message);
		this.name = 'AuthenticationError';
		this.code = code;
		this.message = message;
	}
}

export class RegistrationError extends AuthError {
	constructor(message: string) {
		super(message);
		this.name = 'RegistrationError';
	}
}
export class ConfigError extends AuthError {
	constructor(message: string) {
		super(message);
		this.name = 'ConfigError';
	}
}
