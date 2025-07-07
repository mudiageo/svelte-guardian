<script lang="ts">
	export let headings: Array<{ depth: number; text: string; id: string }> = [];
	
	function getClassName(depth: number): string {
		const padding = Math.min((depth - 1) * 4, 12);
		return `pl-${padding} py-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200`;
	}
</script>

<nav class="not-prose sticky top-20 space-y-1">
	<h4 class="font-medium mb-4">On this page</h4>
	<ul class="space-y-2 border-l">
		{#each headings as heading}
			{#if heading.depth <= 3}
				<li>
					<a
						href="#{heading.id}"
						class={getClassName(heading.depth)}
					>
						{heading.text}
					</a>
				</li>
			{/if}
		{/each}
	</ul>
</nav>