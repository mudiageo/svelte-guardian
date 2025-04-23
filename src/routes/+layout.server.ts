import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface Page {
	title: string;
	path: string;
	content: string;
	order?: number;
}

interface NavigationItem {
	title: string;
	path: string;
	items?: NavigationItem[];
}

		

export const load: LayoutLoad = async ({ url }) => {
	try {
		const docsPath = 'src/docs';
		const sections = await readdir(docsPath, { withFileTypes: true });

    const navigation: Record<string, NavigationItem[]> = {};
		const searchablePages: Page[] = [];
		const allPages: Page[] = [];
		
		for (const section of sections) {
			if (section.isDirectory()) {
				const files = await readdir(join(docsPath, section.name));
				const pages = await Promise.all(
					files
						.filter((file) => file.endsWith('.md') || file.endsWith('.svx'))
						.map(async (file) => {
						  const filePath = join(docsPath, section.name, file);
							const content = await readFile(filePath, 'utf-8');
							const pathname = `/docs/${section.name}/${file.replace(/\.(md|svx)$/, '')}`;
							const path = pathname.endsWith('/index') ? pathname.slice(0, -6) : pathname
							// Extract title from frontmatter or first heading
							const titleMatch = content.match(/^---\s*\ntitle:\s*(.+?)\n|^#\s+(.+)$/m);
							const title = titleMatch ? (titleMatch[1] || titleMatch[2]).trim() : file.replace(/\.(md|svx)$/, '').replace(/-/g, ' ');
							//				const title = file.replace(/\.(md|svx)$/, '').replace(/-/g, ' ');

							
							
							// Extract order from frontmatter if exists
							const orderMatch = content.match(/^---\s*\n(?:.*\n)*order:\s*(\d+)/m);
							const order = orderMatch ? parseInt(orderMatch[1]) : undefined;

							const page = { title, path, content, order };
							allPages.push(page);
							searchablePages.push(page);
							return page;
							
						})
				);
        if (pages.length > 0) {
					// Sort pages by order first, then alphabetically
					const sortedPages = pages.sort((a, b) => {
						if (a.order !== undefined && b.order !== undefined) {
							return a.order - b.order;
						}
						return a.title.localeCompare(b.title);
					});

					// Format section name
					const formattedSection = section.name
						.split('-')
						.map(word => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' ');

					navigation[formattedSection] = sortedPages;
				}
				
			}
		}

		// Calculate previous and next pages
		const currentPageIndex = allPages.findIndex(page => page.path === url.pathname);
		const previous = currentPageIndex > 0 ? allPages[currentPageIndex - 1] : undefined;
		const next = currentPageIndex < allPages.length - 1 ? allPages[currentPageIndex + 1] : undefined;
		
		return {
			navigation,
			searchablePages,
			currentPath: url.pathname,
			previous,
			next
		};
	} catch (err) {
		console.error('Failed to load documentation structure:', err);
		throw error(500, 'Failed to load documentation structure');
	}
};