<script lang="ts">
	import { Twitter, Linkedin, Facebook } from '@lucide/svelte';
	
	export let url: string;
	export let title: string;
	
	const encodedUrl = encodeURIComponent(url);
	const encodedTitle = encodeURIComponent(title);
	
	const shareLinks = {
		twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
	};
</script>

<div class="flex items-center gap-4 mt-8 pt-4 border-t">
	<span class="text-sm font-medium text-muted-foreground">Share this page</span>
	<div class="flex gap-2">
		<a
			href={shareLinks.twitter}
			target="_blank"
			rel="noopener noreferrer"
			class="p-2 text-muted-foreground hover:text-[#1DA1F2] transition-colors duration-200"
			aria-label="Share on Twitter"
		>
			<Twitter class="h-5 w-5" />
		</a>
		<a
			href={shareLinks.linkedin}
			target="_blank"
			rel="noopener noreferrer"
			class="p-2 text-muted-foreground hover:text-[#0A66C2] transition-colors duration-200"
			aria-label="Share on LinkedIn"
		>
			<Linkedin class="h-5 w-5" />
		</a>
		<a
			href={shareLinks.facebook}
			target="_blank"
			rel="noopener noreferrer"
			class="p-2 text-muted-foreground hover:text-[#1877F2] transition-colors duration-200"
			aria-label="Share on Facebook"
		>
			<Facebook class="h-5 w-5" />
		</a>
	</div>
</div>