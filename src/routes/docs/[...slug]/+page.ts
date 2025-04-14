import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const modules = import.meta.glob('/src/docs/**/*.md'); 

export const load = (async ({ params }) => {
	const modulePath = `/src/docs/${params.slug}.md`;

	const potentialModule = modules[modulePath];
console.log("fgh")
console.log(await potentialModule())
console.log("ffhgh")
		//  const post = await import(`$docs/${params.slug}.md`);
		
	if (potentialModule) {
		try {
		
			const post = typeof potentialModule === 'function'
				? await potentialModule() // Lazy loading: call the function
				: potentialModule;       // Eager loading: use the module directly

	
			return {
				content: post.default,
				title: post.metadata?.title ?? 'Documentation',
				description: post.metadata?.description ?? 'Svelte Guardian Documentation'
			};
		} catch (e) {
			console.error(`Error loading module ${modulePath}:`, e);
			throw error(500, `Failed to load documentation for ${params.slug}`);
		}
	} else {
		// If the path doesn't exist in our glob results, it's a 404
		console.warn(`Module not found via glob: ${modulePath}`);
		throw error(404, `Could not find documentation for ${params.slug}`);
	}
}) satisfies PageLoad;

		
		