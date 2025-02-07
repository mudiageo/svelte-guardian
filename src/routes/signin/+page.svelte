<script>
	import { preventDefault } from 'svelte/legacy';
	import { enhance } from '$app/forms';

	import { goto } from '$app/navigation';
	import { signIn } from '$lib/client';
	import { SignIn } from '@auth/sveltekit/components';

	let email = $state('mudiaga@localhost');
	let password = $state('Mudiaga@2024');
	let error = $state('');
	let rememberMe = $state(false);

	async function handleSubmit() {
		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
				callbackUrl: '/auth'
			});
			console.log(result);
			const res = await result.json();

			if (result?.error) {
				error = 'Invalid email or password';
			} else {
				let url = new URL(res.url);
				if (url.pathname === '/auth') goto(url.pathname);
				const errCode = url.searchParams.get('code');
				switch (errCode) {
					case 'unverified_email':
						error = 'Email must be verified';
						if (confirm('Verify email?')) {
							goto('/verify-email');
						}
						break;
				}
			}
		} catch (e) {
			error = 'An error occurred. Please try again.';
		}
	}
</script>

<div
	class="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8 dark:bg-gray-900"
>
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		SvelteForge Logo

		<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
			Sign in to your account
		</h2>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
			{#if error}
				<div class="mb-4 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900 dark:text-red-100">
					{error}
				</div>
			{/if}

			<form class="space-y-6" onsubmit={preventDefault(handleSubmit)}>
				<input type="hidden" name="providerId" value="credentials" />

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Email
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						required
						class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Password
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						required
						class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<input
							id="remember_me"
							type="checkbox"
							bind:checked={rememberMe}
							class="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300 dark:border-gray-600"
						/>
						<label for="remember_me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
							Remember me
						</label>
					</div>

					<div class="text-sm">
						<a
							href="/auth/forgot-password"
							class="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
						>
							Forgot your password?
						</a>
					</div>
				</div>

				<button type="submit" class="btn-primary w-full"> Sign In </button>
			</form>

			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-white px-2 text-gray-500 dark:bg-gray-800">Or continue with</span>
					</div>
				</div>

				<div class="mt-6">
					<button
						type="button"
						onclick={() => signIn('google', { callbackUrl: '/auth/onboarding' })}
						class="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						<svg class="mr-2 h-5 w-5" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
							/>
						</svg>
						Continue with Google
					</button>
				</div>
			</div>

			<p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
				Don't have an account?
				<a
					href="/signup"
					class="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
				>
					Sign up
				</a>
			</p>
		</div>
	</div>
</div>
