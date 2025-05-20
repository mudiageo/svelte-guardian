<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Shield from '@lucide/svelte/icons/shield';
	import Lock from '@lucide/svelte/icons/lock';
	import Zap from '@lucide/svelte/icons/zap';
	
	import * as Card from '$components/ui/card';
</script>

<div class="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-10">
	<div class="container px-4 md:px-6">
		<div class="flex flex-col items-center space-y-4 text-center">
			<div class="space-y-2">
				<h1 class="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
					Svelte Guardian
				</h1>
				<p class="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
					Secure authentication for your Svelte applications. Simple to integrate, powerful to use.
				</p>
			</div>
			<div class="space-x-4">
				<a
					href="/docs/getting-started/introduction"
					class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-1"
				>
					Get Started
					<ArrowRight class="ml-2 h-4 w-4" />
				</a>
			</div>
		</div>
		<div class="mx-auto grid max-w-5xl grid-cols-1 gap-6 pt-16 md:grid-cols-3">
			<Card.Root>
				<Card.Header class="space-y-2">
					<Shield class="h-6 w-6" />
					<Card.Title>Secure by Default</Card.Title>
					<Card.Description>
						Built with security best practices. Includes CSRF protection, secure sessions, and more.
					</Card.Description>
				</Card.Header>
			</Card.Root>
			<Card.Root>
				<Card.Header class="space-y-2">
					<Lock class="h-6 w-6" />
					<Card.Title>Easy Integration</Card.Title>
					<Card.Description>
						Simple to set up and integrate with your existing Svelte applications.
					</Card.Description>
				</Card.Header>
			</Card.Root>
			<Card.Root>
				<Card.Header class="space-y-2">
					<Zap class="h-6 w-6" />
					<Card.Title>Performant</Card.Title>
					<Card.Description>
						Optimized for performance with minimal overhead and efficient caching.
					</Card.Description>
				</Card.Header>
			</Card.Root>
		</div>
	</div>
</div>

			<a href="/signin">login </a>
			<a href="/signup">sign up</a>
			<a href="/admin">Admin </a>
			<a href="/protect">Protect</a>
			<a href="/dashboard">Dashboard</a>
			<a href="/auth/signout">Signout</a>
			<a href="/reset-password">Reset password</a>
			<a href="/verify-email">Verify email</a>