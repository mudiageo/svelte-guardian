<script>
	import { page } from '$app/state';
	import TableOfContents from '$components/TableOfContents.svelte';
	import Breadcrumbs from '$components/Breadcrumbs.svelte';
	import ShareButtons from '$components/ShareButtons.svelte';
	
		/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 * @property {string[]} [headings]
	 */

	/** @type {Props} */
	let { children, headings = [] } = $props();
	
</script>

<div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
	<div>
		<Breadcrumbs path={page.url.pathname} />
		
		<div class="prose dark:prose-invert max-w-none">
				{@render children?.()}
		</div>
		
		<ShareButtons
			url={page.url.href}
			title={page.data.title}
		/>
		{#if page.data.previous || page.data.next}
	<div class="mt-16 border-t pt-8">
		<div class="flex justify-between">
			{#if page.data.previous}
				<a
					href={page.data.previous.path}
					class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
				>
					← {page.data.previous.title}
				</a>
			{:else}
				<div></div> 
			{/if}

			{#if page.data.next}
				<a
					href={page.data.next.path}
					class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
					>
			
					
				>
					{page.data.next.title} →
				</a>
			{:else}
				<div></div>
			{/if}
		</div>
	</div>
{/if}
				
	</div>
	
	<div class="hidden lg:block">
		<TableOfContents {headings} />
	</div>
</div>