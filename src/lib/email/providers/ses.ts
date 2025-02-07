import { EmailOptions, EmailProvider } from '../types';
import { html, text } from '../utils';

export class AWSSESProvider implements EmailProvider {
	private accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
	private secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
	private region = process.env.AWS_REGION || 'us-east-1';
	private from = process.env.EMAIL_FROM || 'Acme <noreply@yourdomain.com>';

	private createSignatureKey(date: string, region: string, service: string) {
		const kDate = this.hmac('AWS4' + this.secretAccessKey, date);
		const kRegion = this.hmac(kDate, region);
		const kService = this.hmac(kRegion, service);
		const kSigning = this.hmac(kService, 'aws4_request');
		return kSigning;
	}

	private hmac(key: string | Buffer, data: string) {
		return crypto.createHmac('sha256', key).update(data).digest();
	}

	private createCanonicalRequest(
		method: string,
		canonicalUri: string,
		canonicalQuerystring: string,
		canonicalHeaders: string,
		signedHeaders: string,
		payloadHash: string
	) {
		return `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
	}

	private createStringToSign(date: string, credentialScope: string, canonicalRequest: string) {
		const hashedCanonicalRequest = crypto
			.createHash('sha256')
			.update(canonicalRequest)
			.digest('hex');
		return `AWS4-HMAC-SHA256\n${date}\n${credentialScope}\n${hashedCanonicalRequest}`;
	}

	private createSignature(stringToSign: string, signingKey: Buffer) {
		return crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
	}

	private getAuthorizationHeader(
		date: string,
		region: string,
		service: string,
		signedHeaders: string,
		signature: string
	) {
		const credentialScope = `${date}/${region}/${service}/aws4_request`;
		return `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
	}

	async send(options: EmailOptions): Promise<void> {
		const { to, subject, type, otp, url, theme, customContent } = options;
		const { host } = new URL(url || '');

		const emailHtml = html({ url, host, theme, otp, type, customContent });
		const emailText = text({ url, host, otp, type, customContent });

		const service = 'ses';
		const method = 'POST';
		const canonicalUri = '/v2/email/outbound-emails';
		const canonicalQuerystring = '';

		const now = new Date();
		const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
		const dateStamp = amzDate.split('T')[0];

		const payload = JSON.stringify({
			Content: {
				Simple: {
					Subject: {
						Data: subject,
						Charset: 'UTF-8'
					},
					Body: {
						Html: {
							Data: emailHtml,
							Charset: 'UTF-8'
						},
						Text: {
							Data: emailText,
							Charset: 'UTF-8'
						}
					}
				}
			},
			Destination: {
				ToAddresses: [to]
			},
			FromEmailAddress: this.from
		});

		const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

		const canonicalHeaders =
			`content-type:application/json\n` +
			`host:email.${this.region}.amazonaws.com\n` +
			`x-amz-date:${amzDate}\n`;

		const signedHeaders = 'content-type;host;x-amz-date';

		const canonicalRequest = this.createCanonicalRequest(
			method,
			canonicalUri,
			canonicalQuerystring,
			canonicalHeaders,
			signedHeaders,
			payloadHash
		);

		const credentialScope = `${dateStamp}/${this.region}/${service}/aws4_request`;
		const stringToSign = this.createStringToSign(amzDate, credentialScope, canonicalRequest);
		const signingKey = this.createSignatureKey(dateStamp, this.region, service);
		const signature = this.createSignature(stringToSign, signingKey);

		const authorizationHeader = this.getAuthorizationHeader(
			amzDate,
			this.region,
			service,
			signedHeaders,
			signature
		);

		try {
			const res = await fetch(`https://email.${this.region}.amazonaws.com${canonicalUri}`, {
				method: method,
				headers: {
					'Content-Type': 'application/json',
					'X-Amz-Date': amzDate,
					Authorization: authorizationHeader,
					'X-Amz-Content-Sha256': payloadHash
				},
				body: payload
			});

			if (!res.ok) {
				const errorBody = await res.text();
				throw new Error(`AWS SES error: ${errorBody}`);
			}
		} catch (error) {
			throw new Error(
				`AWS SES send error: ${error instanceof Error ? error.message : JSON.stringify(error)}`
			);
		}
	}
}
