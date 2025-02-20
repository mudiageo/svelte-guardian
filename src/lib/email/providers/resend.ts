import { EmailOptions, EmailProvider } from '../types';
import { html, text } from '../utils';

export class ResendProvider implements EmailProvider {
	private apiKey = process.env.RESEND_API_KEY;
	private from = process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>';

	async send(options: EmailOptions): Promise<void> {
		const { to, subject, type, otp, url, theme, customContent } = options;
		const { host } = new URL(url || '');

		const emailHtml = html({ url, host, theme, otp, type, customContent });
		const emailText = text({ url, host, otp, type, customContent });

		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: this.from,
				to,
				subject,
				html: emailHtml,
				text: emailText
			})
		});

		if (!res.ok) {
			throw new Error(`Resend error: ${JSON.stringify(await res.json())}`);
		}
	}
}
