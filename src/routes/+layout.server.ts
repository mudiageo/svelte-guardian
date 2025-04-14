import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface Page {
	title: string;
	path: string;
	content: string;
}

export const load: LayoutLoad = async ({ url }) => {
	try {
		const docsPath = 'src/docs';
		const sections = await readdir(docsPath, { withFileTypes: true });

		const navigation: Record<string, Array<{ title: string; path: string }>> = {};
		const searchablePages: Page[] = [];

		for (const section of sections) {
			if (section.isDirectory()) {
				const files = await readdir(join(docsPath, section.name));
				const pages = await Promise.all(
					files
						.filter((file) => file.endsWith('.md') || file.endsWith('.svx'))
						.map(async (file) => {
							const path = `/docs/${section.name}/${file.replace(/\.(md|svx)$/, '')}`;
							const content = await readFile(join(docsPath, section.name, file), 'utf-8');
							const title = file.replace(/\.(md|svx)$/, '').replace(/-/g, ' ');

							searchablePages.push({ title, path, content });

							return { title, path };
						})
				);

				if (pages.length > 0) {
					navigation[section.name] = pages;
				}
			}
		}

		return {
			navigation,
			searchablePages,
			currentPath: url.pathname
		};
	} catch (err) {
		console.error('Failed to load documentation structure:', err);
		throw error(500, 'Failed to load documentation structure');
	}
};