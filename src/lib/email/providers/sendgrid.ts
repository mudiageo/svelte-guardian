import type { EmailOptions, EmailProvider } from '../types';
import { text, html } from '../utils';

export class SendGridProvider implements EmailProvider {
	private apiKey = process.env.SENDGRID_API_KEY;
	private from = process.env.EMAIL_FROM || 'Acme <no-reply@example.com>';

	async send(options: EmailOptions): Promise<void> {
		const { to, subject, type, otp, url, theme, customContent } = options;
		const { host } = new URL(url || '');

		const emailHtml = html({ url, host, theme, otp, type, customContent });
		const emailText = text({ url, host, otp, type, customContent });

		const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				personalizations: [{ to: [{ email: to }] }],
				from: { email: this.from },
				subject,
				content: [
					{ type: 'text/plain', value: emailText },
					{ type: 'text/html', value: emailHtml }
				]
			})
		});

		if (!res.ok) {
			throw new Error(`SendGrid error: ${JSON.stringify(await res.json())}`);
		}
	}
}
