<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Shield from '@lucide/svelte/icons/shield';
	import Lock from '@lucide/svelte/icons/lock';
	import Zap from '@lucide/svelte/icons/zap';
	import Key from '@lucide/svelte/icons/key';
	import UserCheck from '@lucide/svelte/icons/user-check';
	import Settings from '@lucide/svelte/icons/settings';
	
	import * as Card from '$components/ui/card';
	import { Button } from '$components/ui/button';

	const features = [
		{
			icon: Shield,
			title: 'Secure by Default',
			description: 'Built with security best practices including CSRF protection, secure sessions, and more.'
		},
		{
			icon: Lock,
			title: 'Multiple Auth Methods',
			description: 'Support for credentials, OAuth providers, and passwordless authentication.'
		},
		{
			icon: Zap,
			title: 'High Performance',
			description: 'Optimized for speed with minimal overhead and efficient caching strategies.'
		},
		{
			icon: Key,
			title: 'Role-Based Access',
			description: 'Fine-grained access control with role-based route protection.'
		},
		{
			icon: UserCheck,
			title: 'User Management',
			description: 'Complete user lifecycle management with email verification and password reset.'
		},
		{
			icon: Settings,
			title: 'Customizable',
			description: 'Highly configurable to match your application\'s specific needs.'
		}
	];
</script>

<div class="relative min-h-screen">
	<!-- Hero Section -->
	<div class="relative overflow-hidden bg-white dark:bg-slate-950">
		<div class="absolute inset-0 dark:bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
		<div class="container relative mx-auto px-4 py-24 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-4xl text-center">
				<h1 class="bg-gradient-to-r from-slate-800 dark:from-indigo-200 dark:via-purple-200 to-pink-200 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl xl:text-7xl">
					Svelte Guardian
				</h1>
				<p class="mt-6 text-xl text-slate-300 sm:text-2xl">
					Secure, flexible authentication for your SvelteKit applications. Simple to integrate, powerful to use.
				</p>
				<div class="mt-10 flex items-center justify-center gap-6">
					<Button href="/docs/getting-started/introduction" variant="default" size="lg">
						Get Started
						<ArrowRight class="ml-2 h-5 w-5" />
					</Button>
					<Button href="/docs" variant="outline" size="lg">
						Documentation
					</Button>
				</div>
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<div class="bg-white py-24 dark:bg-slate-900 sm:py-32">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
					Everything you need for authentication
				</h2>
				<p class="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
					Built with security and developer experience in mind, Svelte Guardian provides a complete authentication solution for your SvelteKit applications.
				</p>
			</div>
			<div class="mx-auto mt-16 max-w-7xl">
				<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{#each features as feature}
						<Card.Root class="flex flex-col">
							<Card.Header>
								<div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20">
									<feature.icon class="h-6 w-6" />
								</div>
								<Card.Title>{feature.title}</Card.Title>
								<Card.Description>{feature.description}</Card.Description>
							</Card.Header>
						</Card.Root>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- CTA Section -->
	<div class="bg-slate-50 py-24 dark:bg-slate-800 sm:py-32">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
					Ready to get started?
				</h2>
				<p class="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
					Add secure authentication to your SvelteKit application in minutes.
				</p>
				<div class="mt-10 flex items-center justify-center gap-6">
					<Button href="/docs/getting-started/installation" variant="default" size="lg">
						Install Now
					</Button>
					<Button href="https://github.com/mudiageo/svelte-guardian" variant="outline" size="lg">
						View on GitHub
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>
