<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	
	import { signIn } from '@auth/sveltekit/client';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let formData = $state({
		name: 'Mudiaga ',
		email: 'mudiaga@localhost',
		password: 'Mudiaga@2024',
		confirmPassword: 'Mudiaga@2024'
	});

	let error = $state(form?.error || '');
	$effect(() => {
		console.log(form?.error);
		error = form?.error;
	});
	
</script>

{#if form?.success}
	<!-- this message is ephemeral; it exists because the page was rendered in
	       response to a form submission. it will vanish if the user reloads -->
	<p>Successfully logged in! Welcome back, {data?.user}</p>
{/if}

<div
	class="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8 dark:bg-gray-900"
>
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
			Create your account
		</h2>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-white px-4 py-8 shadow-sm sm:rounded-lg sm:px-10 dark:bg-gray-800">
			{#if error}
				<div class="mb-4 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900 dark:text-red-100">
					{error}
				</div>
			{/if}

			<form class="space-y-6" method="POST" use:enhance>
				<input type="hidden" name="providerId" value="credentials" />
				<input type="hidden" name="redirect" value={false} />

				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Name
					</label>
					<input
						type="text"
						id="name"
						name="name"
						bind:value={formData.name}
						required
						class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						bind:value={formData.email}
						required
						class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						bind:value={formData.password}
						required
						minlength="8"
						class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label
						for="confirmPassword"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Confirm Password
					</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						bind:value={formData.confirmPassword}
						required
						minlength="8"
						class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<button type="submit" class="btn-primary w-full"> Sign Up </button>
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
						class="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
				Already have an account?
				<a href="/auth/login" class="text-primary-600 hover:text-primary-500 font-medium">
					Sign in
				</a>
			</p>
		</div>
	</div>
</div>
