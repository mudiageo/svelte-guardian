import { EmailOptions, EmailProvider } from './types';
import { createEmailProvider } from './providers';
const DEFAULT_PROVIDER = process.env.EMAIL_PROVIDER;

export async function sendEmail(options: EmailOptions, providerConfig: EmailProviderConfig) {
	const provider = await createEmailProvider(providerConfig);

	await provider.send(options);
}
