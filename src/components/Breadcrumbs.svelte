<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	
	export let path: string;
	
	$: segments = path
		.split('/')
		.filter(Boolean)
		.map((segment, index, array) => ({
			name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
			href: '/' + array.slice(0, index + 1).join('/')
		}));
</script>

<nav aria-label="Breadcrumb" class="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
	<a href="/" class="hover:text-foreground transition-colors duration-200">Home</a>
	{#each segments as segment}
		<ChevronRight class="h-4 w-4" />
		<a
			href={segment.href}
			class="hover:text-foreground transition-colors duration-200"
		>
			{segment.name}
		</a>
	{/each}
</nav>