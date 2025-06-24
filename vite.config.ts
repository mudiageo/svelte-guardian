import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
 
export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		rollupOptions: {
			external: [
				'@auth/drizzle-adapter',
				'@auth/mongodb-adapter',
				'@auth/drizzle-adapter',
				'@auth/pg-adapter',
				'@auth/mysql-adapter',
				'@auth/sqlite-adapter',
				'@auth/supabase-adapter'
			]
		}
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
