<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import SearchDialog from '$components/SearchDialog.svelte';
	import AppSidebar from "$components/app-sidebar.svelte";
	import { Separator } from "$components/ui/separator";
	import * as Sidebar from "$components/ui/sidebar";
	import ThemeToggle from '$components/ThemeToggle.svelte';
	import { PUBLIC_GITHUB_REPO } from '$env/static/public';
 import { ModeWatcher } from "mode-watcher";
 

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();


	const GITHUB_REPO = PUBLIC_GITHUB_REPO || 'https://github.com/mudiageo/svelte-guardian';
	let sidebarOpen = $state(false)

	let navigation = $derived(page.data.navigation || []);


</script>

<ModeWatcher />


<Sidebar.Provider>
	<AppSidebar {navigation} class="bg-white z-500" />
	<Sidebar.Inset>
<div class="flex min-h-screen flex-col">
		<header
			class="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 z-30 border-b bg-background/95 backdrop-blur-sm"
		>
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 h-4" />
		

				<div class="flex items-center gap-4">
					<SearchDialog pages={page.data.searchablePages || []} />
				</div>
				<div class="flex items-center gap-4">
					<ThemeToggle />
					<a
						href="{GITHUB_REPO}/edit/docs/src{page.url.pathname}.md"
						class="text-sm text-muted-foreground hover:text-foreground"
						target="_blank"
						rel="noopener noreferrer"
					>
						Edit on GitHub
					</a>
				</div>
		</header>

		  	<!-- Main content -->
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
	</Sidebar.Inset>
</Sidebar.Provider>




