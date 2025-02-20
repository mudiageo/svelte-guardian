<script lang="ts">
	import { goto } from '$app/navigation';
	import { emailVerification } from '$lib/client';
	export let data;
	let email = data?.session?.email || '';
	let otp = '';
	let loading = false;
	let error = '';
	let verificationSent = data?.verificationSent || false;

	async function handleSendOTP() {
		loading = true;
		error = '';

		const result = await emailVerification.handleEmailVerification(email, 'otp');

		if (result.success) {
			verificationSent = true;
		} else {
			error = result.error || 'Failed to send verification code';
		}

		loading = false;
	}

	async function handleVerifyOTP() {
		loading = true;
		error = '';

		const result = await emailVerification.verifyOTP(email, otp);
		console.log(result);
		if (result.success) {
			// Redirect to success page or dashboard
			goto('/auth/verified');
		} else {
			error = result.error || 'Invalid verification code';
		}

		loading = false;
	}
</script>

<div class="auth-container">
	{#if !verificationSent}
		<h2>Verify Your Email</h2>
		<form on:submit|preventDefault={handleSendOTP}>
			<input type="email" bind:value={email} placeholder="Enter your email" required />
			<button type="submit" disabled={loading}>
				{loading ? 'Sending...' : 'Send Verification Code'}
			</button>
		</form>
	{:else}
		<h2>Enter Verification Code</h2>
		<form on:submit|preventDefault={handleVerifyOTP}>
			<input type="text" bind:value={otp} placeholder="Enter verification code" required />
			<button type="submit" disabled={loading}>
				{loading ? 'Verifying...' : 'Verify Code'}
			</button>
		</form>
	{/if}

	{#if error}
		<p class="error">{error}</p>
	{/if}
</div>
