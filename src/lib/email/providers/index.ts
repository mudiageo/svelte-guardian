import { EmailOptions, EmailProvider, EmailProviderConfig } from '../types';
import { validateEmailProviderConfig } from '../utils';
import { NodemailerProvider } from './nodemailer';
import { ResendProvider } from './resend';
import { SendGridProvider } from './sendgrid';
import { AWSSESProvider } from './ses';

export function createEmailProvider(config: EmailProviderConfig): EmailProvider {
	// Validate the configuration first
	validateEmailProviderConfig(config);

	switch (config.type) {
		case 'resend':
			return new ResendProvider(config);
		case 'aws-ses':
			return new AWSSESProvider(config);
		case 'nodemailer':
			return new NodemailerProvider(config);
		default:
			throw new Error(`Provider not implemented for type: ${config.type}`);
	}
}
