import type {
	EmailType,
	EmailService,
	SmtpServerConfig,
	EmailProviderConfig,
	NodemailerServiceConfig
} from './types';
import {
	ALL_SERVICES,
	EMAIL_SERVICE_CONFIGS
} from './types';

interface EmailParams {
	url: string;
	host: string;
	theme?: {
		brandColor?: string;
		buttonText?: string;
	};
	type: EmailType;
	otp?: string; // Only used for OTP type
	customContent?: string;
}

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it, if you do, remember to sanitize it!
 */
export function html(params: EmailParams): string {
	const { url, host, theme, type, otp, customContent } = params;
	const escapedHost = host.replace(/\./g, '&#8203;.');
	const brandColor = theme?.brandColor || '#346df1';
	const buttonText = theme?.buttonText || '#fff';
	const color = {
		background: '#f9f9f9',
		text: '#444',
		mainBackground: '#fff',
		buttonBackground: brandColor,
		buttonBorder: brandColor,
		buttonText
	};

	let content = '';

	switch (type) {
		case 'magicLink':
			content = `
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}">
                                    <a href="${url}" target="_blank"
                                        style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">
                                        Sign in
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            `;
			break;
		case 'otp':
			content = `
                <tr>
                    <td align="center" style="padding: 20px 0; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
                        Your one-time password (OTP) is: <strong>${otp}</strong>
                    </td>
                </tr>
            `;
			break;
		case 'passwordReset':
			content = `
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}">
                                    <a href="${url}" target="_blank"
                                        style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">
                                        Reset Password
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            `;
			break;
		case 'twoFactor':
			content = `
                <tr>
                    <td align="center" style="padding: 20px 0; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
                        Your two-factor authentication code is: <strong>${otp}</strong>
                    </td>
                </tr>
            `;
			break;
		case 'custom':
			return `
                <tr>
                    <td align="center" style="padding: 20px 0; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
                      
                <p>${customContent}</p>
                    </td>
                </tr>
            `;
		default:
			throw new Error(`Unsupported email type: ${type}`);
	}

	return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        ${type === 'passwordReset' ? 'Reset your password for' : 'Sign in to'} <strong>${escapedHost}</strong>
      </td>
    </tr>
    ${content}
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

/**
 * Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
 */
export function text(params: EmailParams): string {
	const { url, host, type, otp, customContent } = params;

	let content = '';

	switch (type) {
		case 'magicLink':
			content = `Sign in to ${host}\n${url}\n\n`;
			break;
		case 'otp':
			content = `Your one-time password (OTP) is: ${otp}\n\n`;
			break;
		case 'passwordReset':
			content = `Reset your password for ${host}\n${url}\n\n`;
			break;
		case 'twoFactor':
			content = `Your two-factor authentication code is: ${otp}\n\n`;
			break;
		case 'custom':
			content = customContent || '';
			break;
		default:
			throw new Error(`Unsupported email type: ${type}`);
	}

	return content + 'If you did not request this email you can safely ignore it.';
}

// Helper function to validate email provider configuration
export function validateEmailProviderConfig(config: EmailProviderConfig): void {
	switch (config.type) {
		case 'resend':
			if (!config.apiKey) {
				throw new Error('Resend API key is required');
			}
			break;
		case 'aws-ses':
			if (!config.accessKeyId || !config.secretAccessKey) {
				throw new Error('AWS SES access key and secret key are required');
			}
			break;
		case 'smtp':
			if (!config.host || !config.port || !config.auth.user || !config.auth.pass) {
				throw new Error('SMTP configuration requires host, port, user, and password');
			}
			break;
		case 'nodemailer':
			validateNodemailerServiceConfig(config);
			if ('transport' in config && !config.transport) {
				throw new Error('Advanced transport configuration requires transport options');
			}
			break;
		case 'mailgun':
			if (!config.apiKey || !config.domain) {
				throw new Error('Mailgun requires API key and domain');
			}
			break;
		case 'sendgrid':
			if (!config.apiKey) {
				throw new Error('SendGrid API key is required');
			}
			break;
		default:
			throw new Error(`Unsupported email provider type: ${config}`);
	}
}

// Function to validate email service configuration
export function validateNodemailerServiceConfig(config: NodemailerServiceConfig): void {
	// Validate service
	if (!ALL_SERVICES.includes(config.service)) {
		throw new Error(`Invalid email service: ${config.service}`);
	}

	// Validate authentication
	switch (config.auth?.method) {
		case 'password':
			if (!config.auth.user || !config.auth.pass) {
				throw new Error('Password authentication requires user and password');
			}
			break;
		case 'app-password':
			if (!config.auth.user || !config.auth.appPass) {
				throw new Error('App password authentication requires user and app password');
			}
			break;
		case 'oauth2':
			if (
				!config.auth.user ||
				!config.auth.clientId ||
				!config.auth.clientSecret ||
				!config.auth.refreshToken
			) {
				throw new Error(
					'OAuth2 authentication requires user, clientId, clientSecret, and refreshToken'
				);
			}
			break;
		default:
			throw new Error(`Unsupported authentication method: ${config.auth}`);
	}
}

// Type guard to check if configuration is for a specific email service
export function isNodemailerServiceConfig(config: NodemailerServiceConfig): boolean {
	return config.type === 'nodemailer' && config.service in EMAIL_SERVICE_CONFIGS;
}

// Utility function to get SMTP configuration for a service
export function getSmtpConfig(service: EmailService): SmtpServerConfig {
	if (!(service in EMAIL_SERVICE_CONFIGS)) {
		throw new Error(`No SMTP configuration found for service: ${service}`);
	}
	return EMAIL_SERVICE_CONFIGS[service];
}
