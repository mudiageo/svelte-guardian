import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';

/**
 * Custom preprocessor to automatically inject script tags at the top of markdown files
 */
const injectScriptToMarkdown = () => {
  const scriptToAdd = `<!-- ... -->
<script>
  import { Code } from '$components/ui/code'
</script>

`;

  return {
    markup: ({ content, filename }) => {
      // Only process .md and .svx files
      if (filename && (filename.endsWith('.md') || filename.endsWith('.svx'))) {
        // Check if the file already has the script tag to avoid duplication
        if (!content.includes("import { Code } from '$components/ui/code'")) {
          // Add the script tag at the beginning of the file
          // Make sure to preserve any frontmatter if it exists
          if (content.startsWith('---')) {
            // Handle frontmatter - find the end of the frontmatter section
            const frontmatterEndIndex = content.indexOf('---', 3);
            if (frontmatterEndIndex !== -1) {
              // Insert after the frontmatter
              const updatedContent = 
                content.substring(0, frontmatterEndIndex + 3) + 
                '\n\n' + 
                scriptToAdd + 
                content.substring(frontmatterEndIndex + 3);
              return { code: updatedContent };
            }
          }
          
          // No frontmatter, just add at the beginning
          return { code: scriptToAdd + content };
        }
      }
      
      // Return unmodified for other file types or if script already exists
      return { code: content };
    }
  };
};


/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$components: './src/components',
			$hooks: './src/hooks',
			$src: './src',
			$docs: './src/docs',
		}
	},
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [
	  injectScriptToMarkdown(),
		mdsvex({
			extensions: ['.md', '.svx'],
			layout: {
				_: './src/components/layouts/markdown.svelte'
			},
			remarkPlugins: [remarkToc],
			rehypePlugins: [rehypeSlug],
			highlight: {
				highlighter: (code, lang) => {
					return `<Code code={\`${code}\`} language="${lang}" />`;
				}
			}
		})
	]
};

export default config;
