<script lang="ts">
	import { page } from '$app/stores';
	import { passwordReset } from '$lib/client';

	let email = $page.url.searchParams.get('email') || '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';

	// Get token from URL if present
	const token = $page.url.searchParams.get('token');

	async function handlePasswordReset() {
		loading = true;
		error = '';

		if (token && email) {
			// Reset password with token
			const result = await passwordReset.resetPassword(email, token, password, confirmPassword);
			console.log(result);
			if (result.success) {
				goto('/signin?reset=success');
			} else {
				error = result.error || 'Failed to reset password';
			}
		} else {
			// Request password reset
			const result = await passwordReset.handlePasswordReset(email);

			if (!result.success) {
				error = result.error || 'Failed to send reset email';
			}
		}

		loading = false;
	}

	// Validate password as user types
	$: passwordValidation = password
		? passwordReset.validatePassword(password, {
				minimumPasswordLength: 8,
				requireSpecialChar: true,
				requireNumber: true,
				requireUppercase: true
			})
		: { valid: false, errors: [] };
</script>

<div class="auth-container">
	<h2>{token ? 'Reset Password' : 'Request Password Reset'}</h2>

	<form on:submit|preventDefault={handlePasswordReset}>
		{#if !token || !email}
			<input type="email" bind:value={email} placeholder="Enter your email" required />
		{:else}
			<input type="password" bind:value={password} placeholder="New password" required />
			<input
				type="password"
				bind:value={confirmPassword}
				placeholder="Confirm new password"
				required
			/>

			{#if password && !passwordValidation.valid}
				<ul class="validation-errors">
					{#each passwordValidation.errors as error}
						<li>{error}</li>
					{/each}
				</ul>
			{/if}
		{/if}

		<button type="submit" disabled={loading || (token && !passwordValidation.valid)}>
			{loading ? 'Processing...' : token ? 'Reset Password' : 'Send Reset Link'}
		</button>
	</form>

	{#if error}
		<p class="error">{error}</p>
	{/if}
</div>
