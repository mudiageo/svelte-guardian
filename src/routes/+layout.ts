import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

const modules = import.meta.glob('../docs/**/*.md');

interface Page {
	title: string;
	path: string;
	content: string;
	order?: number;
}

interface NavigationItem {
	title: string;
	path: string;
	item?: NavigationItem
}

type Navigation = Record<string, NavigationItem[]>;

export const load: LayoutLoad = async ({ url }) => {
	try {
		const navigation: Navigation = {};
		const allPages: Page[] = [];
		const pagesBySection: Map<string, Page[]> = new Map();

		for (const [relativePath, importer] of Object.entries(modules)) {
			const pathWithoutBase = relativePath.replace('../docs/', '');
			const parts = pathWithoutBase.split('/');

			if (parts.length < 1 || (parts.length === 1 && parts[0] === '')) {
				console.warn(`Skipping unexpected path format from glob: ${relativePath}`);
				continue;
			}

			const filename = parts[parts.length - 1];
			const sectionDir = parts.length > 1 ? parts[parts.length - 2] : '';

			let pageSlug = filename.replace(/\.md$/, '');
			const basePath = sectionDir ? `/docs/${sectionDir}` : '/docs';
            const pagePath = `${basePath}/${pageSlug}`;
            const finalPath = pagePath.endsWith('/index') ? pagePath.slice(0, -6) : pagePath;
            const normalizedFinalPath = finalPath === '/docs' && pageSlug === 'index' && sectionDir === '' ? '/docs' : finalPath;

			try {
                const module = await (importer as () => Promise<{ default: string; metadata?: { title?: string; order?: number } }>);
                
        const pageMd = typeof module === 'function'	? await module()	: module;

                const content = pageMd.default;
                
                const metadata = pageMd.metadata;

				let title: string = metadata?.title;
				let order: number | undefined = metadata?.order;


				const page: Page = {
					title,
					path: normalizedFinalPath,
					content,
					order,
				};

				allPages.push(page);

				const sectionKey = sectionDir || '_root';

				if (!pagesBySection.has(sectionKey)) {
					pagesBySection.set(sectionKey, []);
				}
				pagesBySection.get(sectionKey)!.push(page);

			} catch (e) {
				console.error(`Error processing module ${relativePath}:`, e);
				console.warn(`Skipping page due to load or parse error: ${relativePath}`);
			}
		}

		const sortedSectionKeys = Array.from(pagesBySection.keys()).sort((a, b) => {
			if (a === '_root') return 1;
			if (b === '_root') return -1;
			return a?.localeCompare(b) || 1;
		});

		for (const sectionKey of sortedSectionKeys) {
			const pages = pagesBySection.get(sectionKey)!;

			pages.sort((a, b) => {
				if (a.order !== undefined && b.order !== undefined) {
					return a.order - b.order;
				}
				if (a.order !== undefined && b.order === undefined) return -1;
				if (a.order === undefined && b.order !== undefined) return 1;
				return a.title?.localeCompare(b.title);
			});

			const formattedSection = sectionKey === '_root'
				? 'Documentation'
				: sectionKey
					.split('-')
					.map(word => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ');

			navigation[formattedSection] = pages.map(page => ({ title: page.title, path: page.path }));
		}

		allPages.sort((a, b) => a.path?.localeCompare(b.path));

		const searchablePages: Page[] = allPages;

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
		error(500, 'Failed to load documentation structure');
	}
};