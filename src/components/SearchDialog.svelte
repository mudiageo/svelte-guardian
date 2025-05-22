<script lang="ts">
	import * as Dialog from '$components/ui/dialog';
	import * as Command from '$components/ui/command';
	import Search from '@lucide/svelte/icons/search';
	import { goto } from '$app/navigation';
	import Fuse from 'fuse.js';
	import { onMount } from 'svelte';

	interface Props {
		pages?: Array<{ title: string; path: string; content: string }>;
	}

	let { pages = [] }: Props = $props();

	let open = $state(false);
	let searchResults: Array<{ title: string; path: string }> = $state([]);
	let fuse: Fuse<any>;

	onMount(() => {
		fuse = new Fuse(pages, {
			keys: ['title', 'content'],
			threshold: 0.3,
			includeMatches: true
		});
	});

	function handleSearch(query: string) {
		if (!query) {
			searchResults = [];
			return;
		}
		searchResults = fuse.search(query).map((result) => result.item);
	}

	function handleSelect(path: string) {
		open = false;
		goto(path);
	}

	function handleKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
			event.preventDefault();
			open = true;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<button
	class="inline-flex items-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
	onclick={() => (open = true)}
>
	<Search class="mr-2 h-4 w-4" />
	Search...
	<kbd
		class="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
	>
		<span class="text-xs">⌘</span>K
	</kbd>
</button>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[850px] p-0">
		<Command.Root class="rounded-lg border shadow-md">
			<Command.Input placeholder="Search documentation..." oninput={(e) => handleSearch(e.currentTarget.value)} />
			<Command.Empty>No results found.</Command.Empty>
			<Command.Group>
				{#each searchResults as result}
					<Command.Item onSelect={() => handleSelect(result.path)} class="cursor-pointer">
						<div class="truncate">
							<span class="font-medium">{result.title}</span>
							<span class="ml-2 text-sm text-muted-foreground truncate">{result.path}</span>
						</div>
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Dialog.Content>
</Dialog.Root>