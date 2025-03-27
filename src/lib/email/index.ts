import type { EmailOptions, EmailProviderConfig } from './types';
import { createEmailProvider } from './providers';

export async function sendEmail(options: EmailOptions, providerConfig: EmailProviderConfig) {
	const provider = await createEmailProvider(providerConfig);

	await provider.send(options);
}
