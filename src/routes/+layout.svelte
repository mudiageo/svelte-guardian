<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte'
	import { page } from '$app/state';
	import SearchDialog from '$components/SearchDialog.svelte';
	import VersionSelector from '$components/VersionSelector.svelte';
	import * as Sheet from '$components/ui/sheet';
	import Menu from '@lucide/svelte/icons/menu';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ThemeToggle from '$components/ThemeToggle.svelte';
	import { PUBLIC_GITHUB_REPO } from '$env/static/public';
 import { ModeWatcher } from "mode-watcher";
 

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();


	const GITHUB_REPO = PUBLIC_GITHUB_REPO || 'https://github.com/mudiageo/svelte-guardian';
	let sidebarOpen = $state(false)

	let navigation = $derived(page.data.navigation || {});
	let currentPath = $derived(page.url.pathname);

	
	import * as Collapsible from '$components/ui/collapsible';
	

	// Track expanded sections
	let expandedSections: Record<string, boolean> = $state({});

  Object.entries(navigation).forEach(([section, items]) => {
				expandedSections[section] = false;
		});
	// Initialize sections as expanded if they contain the current page
	$effect(() => {
		Object.entries(navigation).forEach(([section, items]) => {
			if (items.some(item => item.path === currentPath)) {
				expandedSections[section] = true;
			}
		});
	})
</script>

<ModeWatcher />

<div class="flex min-h-screen flex-col">
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
					
					<Collapsible.Root
							bind:open={expandedSections[section]}
							class="mb-4"
						>
							<Collapsible.Trigger
								class="flex w-full items-center justify-between py-2 text-lg font-semibold hover:text-primary"
							>
								{section}
								<ChevronDown
									class="h-4 w-4 transition-transform {expandedSections[section] ? 'rotate-180' : ''}"
								/>
							</Collapsible.Trigger>
							<Collapsible.Content>
								<ul class="mt-2 space-y-2 pl-4">
									{#each items as item}
										<li>
											<a
												href={item.path}
												class="block py-1 px-2 rounded-md transition-colors hover:bg-accent {currentPath === item.path ? 'bg-accent text-accent-foreground' : ''}"
											>
												{item.title}
											</a>
										</li>
									{/each}
								</ul>
							</Collapsible.Content>
						</Collapsible.Root>
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
					<Collapsible.Root
					bind:open={expandedSections[section]}
					class="mb-4"
				>
					<Collapsible.Trigger
						class="flex w-full items-center justify-between py-2 text-lg font-semibold hover:text-primary"
					>
						{section}
						<ChevronDown
							class="h-4 w-4 transition-transform {expandedSections[section] ? 'rotate-180' : ''}"
						/>
					</Collapsible.Trigger>
					<Collapsible.Content>
						<ul class="mt-2 space-y-2 pl-4">
							{#each items as item}
								<li>
									<a
										href={item.path}
										class="block py-1 px-2 rounded-md transition-colors hover:bg-accent {currentPath === item.path ? 'bg-accent text-accent-foreground' : ''}"
									>
										{item.title}
									</a>
								</li>
							{/each}
						</ul>
					</Collapsible.Content>
				</Collapsible.Root>
			{/each}
		</nav>
	</aside>

	<!-- Main content -->
	<div class="flex-1 flex flex-col min-h-screen">
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
		<main class="container py-6 flex-1">
			<article class="prose prose-slate dark:prose-invert max-w-none">
				{@render children?.()}
			</article>
		</main>
		
		<footer class="border-t py-6 bg-muted/50">
			<div class="container">
				<div class="flex flex-col md:flex-row justify-between items-center gap-4">
					<div class="text-sm text-muted-foreground">
						© {new Date().getFullYear()} Svelte Guardian. All rights reserved.
					</div>
					<div class="flex gap-6">
						<a
							href={GITHUB_REPO}
							class="text-sm text-muted-foreground hover:text-foreground"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub
						</a>
						<a
							href="/docs/getting-started"
							class="text-sm text-muted-foreground hover:text-foreground"
						>
							Documentation
						</a>
						<a
							href="/docs/guides"
							class="text-sm text-muted-foreground hover:text-foreground"
						>
							Guides
						</a>
						<a
							href="/docs/api-reference"
							class="text-sm text-muted-foreground hover:text-foreground"
						>
							API Reference
						</a>
					</div>
				</div>
			</div>
		</footer>
	</div>
</div>