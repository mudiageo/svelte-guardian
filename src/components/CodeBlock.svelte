<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import { fly } from 'svelte/transition';
	
	export let code: string;
	export let language: string = '';
	
	let copied = false;
	let timeout: ReturnType<typeof setTimeout>;
	
	async function copyCode() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy code:', err);
		}
	}
</script>

<div class="relative group">
	<pre class="!pr-12"><code class={language}>{code}</code></pre>
	<button
		class="absolute right-2 top-2 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-muted hover:bg-muted/80"
		onclick={copyCode}
		aria-label="Copy code"
	>
		{#if copied}
			<span transition:fly={{ y: -20, duration: 200 }}><Check class="h-4 w-4 text-green-500" /></span>
		{:else}
			<Copy class="h-4 w-4" />
		{/if}
	</button>
</div>