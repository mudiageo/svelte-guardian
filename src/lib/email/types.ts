import nodemailer from 'nodemailer';

export type EmailType = 'magicLink' | 'otp' | 'passwordReset' | 'twoFactor' | 'custom';

export interface EmailOptions {
	to: string;
	subject: string;
	type: EmailType;
	otp?: string; // For OTP, password reset, etc.
	theme?: string;
	url?: string; // For magic links, password reset links, etc.
	customContent?: string; // For custom email types
}

// type for supported email provider types
export type EmailProviderType =
	| 'resend'
	| 'aws-ses'
	| 'nodemailer'
	| 'smtp'
	| 'mailgun'
	| 'sendgrid';

// Common base configuration for all email providers
interface BaseEmailProviderConfig {
	type: EmailProviderType;
	from?: string;
}

// Resend Provider Configuration
export interface ResendProviderConfig extends BaseEmailProviderConfig {
	type: 'resend';
	apiKey: string;
}

// AWS SES Provider Configuration
export interface AWSSESProviderConfig extends BaseEmailProviderConfig {
	type: 'aws-ses';
	accessKeyId: string;
	secretAccessKey: string;
	region?: string;
}

// Simple SMTP Configuration
export interface SimpleSmtpConfig extends BaseEmailProviderConfig {
	type: 'smtp';
	host: string;
	port: number;
	auth: {
		user: string;
		pass: string;
	};
	secure?: boolean;
}

// Advanced Nodemailer Transport Configuration
export interface AdvancedNodemailerConfig extends BaseEmailProviderConfig {
	type: 'nodemailer';
	transport: nodemailer.TransportOptions;
}

// Mailgun Provider Configuration
export interface MailgunProviderConfig extends BaseEmailProviderConfig {
	type: 'mailgun';
	apiKey: string;
	domain: string;
}

// SendGrid Provider Configuration
export interface SendgridProviderConfig extends BaseEmailProviderConfig {
	type: 'sendgrid';
	apiKey: string;
}

// Union type of all possible email provider configurations
export type EmailProviderConfig =
	| ResendProviderConfig
	| AWSSESProviderConfig
	| SimpleSmtpConfig
	| NodemailerServiceConfig
	| AdvancedNodemailerConfig
	| MailgunProviderConfig
	| SendgridProviderConfig;

// Email Provider Interface
export interface EmailProvider {
	send(options: EmailOptions): Promise<void>;
}

// Factory function type for creating email providers
export type EmailProviderFactory = (config: EmailProviderConfig) => EmailProvider;

// Utility type for extracting configuration for a specific provider
export type ConfigForProviderType<T extends EmailProviderType> = Extract<
	EmailProviderConfig,
	{ type: T }
>;

// Union type for specific email services

export const ALL_SERVICES = [
	'gmail',
	'outlook',
	'yahoo',
	'zoho',
	'office365',
	'aol',
	'protonmail'
] as const;
type ServicesTuple = typeof ALL_SERVICES;
export type EmailService = ServicesTuple[number];

//export type EmailService =  'gmail' | 'outlook' | 'yahoo' | 'zoho' | 'office365' | 'aol' | 'protonmail'

// Interface for SMTP server details
export interface SmtpServerConfig {
	host: string;
	port: number;
	secure: boolean;
}

// Email service-specific SMTP configurations
export const EMAIL_SERVICE_CONFIGS: Record<EmailService, SmtpServerConfig> = {
	gmail: {
		host: 'smtp.gmail.com',
		port: 465,
		secure: true
	},
	outlook: {
		host: 'smtp-mail.outlook.com',
		port: 587,
		secure: false
	},
	yahoo: {
		host: 'smtp.mail.yahoo.com',
		port: 465,
		secure: true
	},
	zoho: {
		host: 'smtp.zoho.com',
		port: 465,
		secure: true
	},
	office365: {
		host: 'smtp.office365.com',
		port: 587,
		secure: false
	},
	aol: {
		host: 'smtp.aol.com',
		port: 587,
		secure: false
	},
	protonmail: {
		host: 'smtp.protonmail.ch',
		port: 587,
		secure: true
	}
};

// Authentication method types
export type AuthMethod = 'password' | 'app-password' | 'oauth2';

// Base authentication configuration
interface BaseAuthConfig {
	method: AuthMethod;
}

// Password-based authentication
export interface PasswordAuthConfig extends BaseAuthConfig {
	method: 'password';
	user: string;
	pass: string;
}

// App Password authentication (recommended for services like Gmail)
export interface AppPasswordAuthConfig extends BaseAuthConfig {
	method: 'app-password';
	user: string;
	appPass: string;
}

// OAuth2 Authentication Configuration
export interface OAuth2AuthConfig extends BaseAuthConfig {
	method: 'oauth2';
	user: string;
	clientId: string;
	clientSecret: string;
	refreshToken: string;
	accessToken?: string;
	expires?: number;
}

// Union type for authentication configurations
export type EmailAuthConfig = PasswordAuthConfig | AppPasswordAuthConfig | OAuth2AuthConfig;

// Specific Nodemailer Email Service Configuration
export interface NodemailerServiceConfig extends BaseEmailProviderConfig {
	type: 'nodemailer';
	service: EmailService;
	auth: EmailAuthConfig;

	// Optional additional SMTP configuration
	smtp?: Partial<SmtpServerConfig>;

	// Optional additional options
	options?: {
		pool?: boolean;
		maxConnections?: number;
		maxMessages?: number;
		rateDelta?: number;
		rateLimit?: number;
	};
}
