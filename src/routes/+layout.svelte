<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import SearchDialog from '$components/SearchDialog.svelte';
	import VersionSelector from '$components/VersionSelector.svelte';
	import * as Sheet from '$components/ui/sheet';
	import { Menu } from '@lucide/svelte';
	import ThemeToggle from '$components/ThemeToggle.svelte';
	import { PUBLIC_GITHUB_REPO } from '$env/static/public';
	
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const GITHUB_REPO = PUBLIC_GITHUB_REPO || 'https://github.com/mudiageo/svelte-guardian';
	let sidebarOpen = $state(true)

	let navigation = $derived(page.data.navigation || {});
	let currentPath = $derived(page.url.pathname);
</script>

<div class="flex min-h-screen">
	<!-- Mobile sidebar -->
	<Sheet.Root bind:open={sidebarOpen}>
		<Sheet.Trigger
					class="lg:hidden fixed left-4 top-4 z-40"
				>
					<Menu class="h-6 w-6" />
				</Sheet.Trigger>
		<Sheet.Content side="left" class="w-80">
			<div class="h-full py-6 px-4">
				<div class="flex items-center justify-between mb-6">
					<h1 class="text-2xl font-bold">Svelte Guardian</h1>
				</div>
				<VersionSelector />
				<nav class="mt-6">
					{#each Object.entries(navigation) as [section, items]}
						<div class="mb-6">
							<h2 class="text-lg font-semibold mb-2">{section}</h2>
							<ul class="space-y-2">
								{#each items as item}
									<li>
										<a
											href={item.path}
											class="block py-1 px-2 rounded-md transition-colors hover:bg-accent {currentPath === item.path ? 'bg-accent' : ''}"
										>
											{item.title}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</nav>
			</div>
		</Sheet.Content>
	</Sheet.Root>

	<!-- Desktop sidebar -->
	<aside class="hidden lg:block w-64 border-r min-h-screen p-6">
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-2xl font-bold">Svelte Guardian</h1>
		</div>
		<VersionSelector />
		<nav class="mt-6">
			{#each Object.entries(navigation) as [section, items]}
				<div class="mb-6">
					<h2 class="text-lg font-semibold mb-2">{section}</h2>
					<ul class="space-y-2">
						{#each items as item}
							<li>
								<a
									href={item.path}
									class="block py-1 px-2 rounded-md transition-colors hover:bg-accent {currentPath === item.path ? 'bg-accent' : ''}"
								>
									{item.title}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</nav>
	</aside>

	<!-- Main content -->
	<div class="flex-1">
		<header class="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
			<div class="container flex h-14 items-center justify-between">
				<div class="flex items-center gap-4">
					<SearchDialog pages={page.data.searchablePages || []} />
				</div>
				<div class="flex items-center gap-4">
					<ThemeToggle />
					<a
						href={`${GITHUB_REPO}/edit/docs/src${page.url.pathname}.md`}
						class="text-sm text-muted-foreground hover:text-foreground"
						target="_blank"
						rel="noopener noreferrer"
					>
						Edit on GitHub
					</a>
				</div>
			</div>
		</header>
		<main class="container py-6">
			<article class="prose prose-slate dark:prose-invert max-w-none">
				{@render children?.()}
			</article>
		</main>
	</div>
</div>