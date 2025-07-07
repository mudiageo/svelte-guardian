import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const modules = import.meta.glob('../../../docs/**/*.md'); 

export const load = (async ({ url, params }) => {
  let slug = params.slug.endsWith('.md') ? params.slug.slice(0, -3) : params.slug
  const modulePath = `../../../docs/${slug}.md`;

  const potentialModule = Object.entries(modules).find(([path, module]) => {  
    return path === modulePath || path.match(new RegExp(`^../../../docs/${slug}/?index\.md$`));
  })?.[1]
		
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
			error(500, `Failed to load documentation for ${params.slug}`);
		}
	} else {
		// If the path doesn't exist in our glob results, it's a 404
		console.warn(`Module not found via glob: ${modulePath}`);
		error(404, `Could not find documentation for ${params.slug}`);
	}
}) satisfies PageLoad;

;
		
