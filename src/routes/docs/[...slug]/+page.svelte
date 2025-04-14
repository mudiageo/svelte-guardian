<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.data.title} - Svelte Guardian</title>
	<meta name="description" content={page.data.description} />
</svelte:head>

<div class="prose dark:prose-invert max-w-none">
	<page.data.content />
</div>