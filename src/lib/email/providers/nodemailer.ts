import nodemailer from 'nodemailer';
import {
	type EmailOptions,
	type EmailProvider,
	type NodemailerServiceConfig,
	EMAIL_SERVICE_CONFIGS
} from '../types';
import { html, text, validateNodemailerServiceConfig } from '../utils';

export class NodemailerProvider implements EmailProvider {
	private transporter: nodemailer.Transporter;
	private from: string;

	constructor(config: NodemailerServiceConfig) {
		this.transporter = this.createTransporter(config);
		this.from = '';
	}

	// Create transporter based on service configuration
	private createTransporter(config: NodemailerServiceConfig): nodemailer.Transporter {
		// Validate the configuration
		validateNodemailerServiceConfig(config);

		// Get base SMTP configuration for the service
		const smtpConfig = this.getSmtpConfig(config);

		// Configure authentication
		const auth = this.configureAuth(config);
		// Create transporter
		return nodemailer.createTransport({
			host: smtpConfig.host,
			port: smtpConfig.port,
			secure: smtpConfig.secure,
			auth,
			...(config.options || {})
		});
	}

	// Get SMTP configuration for the service
	private getSmtpConfig(config: NodemailerServiceConfig): SmtpServerConfig {
		if (config.service) {
			const baseConfig = EMAIL_SERVICE_CONFIGS[config.service];
			return config.smtp ? { ...baseConfig, ...config.smtp } : baseConfig;
		}

		throw new Error('No SMTP configuration found');
	}

	// Configure authentication based on method
	private configureAuth(config: NodemailerServiceConfig) {
		switch (config.auth?.method) {
			case 'password':
				return {
					user: config.auth.user,
					pass: config.auth.pass
				};
			case 'app-password':
				return {
					user: config.auth.user,
					pass: config.auth.appPass
				};
			case 'oauth2':
				return {
					type: 'OAuth2',
					user: config.auth.user,
					clientId: config.auth.clientId,
					clientSecret: config.auth.clientSecret,
					refreshToken: config.auth.refreshToken,
					accessToken: config.auth.accessToken
				};
			default:
				throw new Error(`Unsupported authentication method`);
		}
	}

	async send(options: EmailOptions): Promise<void> {
		const { to, subject, type, otp, url, theme, customContent } = options;
		const { host = '' } = url ? new URL(url) : {};

		const emailHtml = html({ url, host, theme, otp, type, customContent });
		const emailText = text({ url, host, otp, type, customContent });
		console.log(emailText);

		try {
			await this.transporter.sendMail({
				from: this.from,
				to,
				subject,
				html: emailHtml,
				text: emailText
			});
		} catch (error) {
			throw new Error(`Nodemailer error: ${JSON.stringify(error)}`);
		}
	}

	// Method to verify transporter connection
	async verify(): Promise<boolean> {
		try {
			await this.transporter.verify();
			return true;
		} catch (error) {
			console.error('Email transporter verification failed:', error);
			return false;
		}
	}
}
