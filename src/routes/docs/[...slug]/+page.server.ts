import type { EntryGenerator } from './$types';
import { readdir } from 'fs/promises';
import { join } from 'path';

export const prerender = true

export const entries: EntryGenerator = async () => {
  const docsPath = 'src/docs';
		const sections = await readdir(docsPath, { withFileTypes: true });
		const allPages = [];

		for (const section of sections) {
			if (section.isDirectory()) {
				const files = await readdir(join(docsPath, section.name));
				const pages = await Promise.all(
					files
						.filter((file) => file.endsWith('.md') || file.endsWith('.svx'))
						.map(async (file) => {
						
							const path = `${section.name}/${file.replace(/\.(md|svx)$/, '')}`;

  const pathname = path.endsWith('/index') ? path.slice(0, -6) : path
							const page = {slug: pathname };
							allPages.push(page);
							return page;
							
						})
				);
      
				console.log(pages)
			}
		}
 return allPages;
};
