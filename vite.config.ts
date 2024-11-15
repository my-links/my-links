import { getDirname } from '@adonisjs/core/helpers';
import inertia from '@adonisjs/inertia/client';
import adonisjs from '@adonisjs/vite/client';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		inertia({ ssr: { enabled: true, entrypoint: 'inertia/app/ssr.tsx' } }),
		react(),
		adonisjs({
			entrypoints: ['inertia/app/app.tsx'],
			reload: ['resources/views/**/*.edge'],
		}),
	],

	/**
	 * Define aliases for importing modules from
	 * your frontend code
	 */
	resolve: {
		alias: {
			'~/': `${getDirname(import.meta.url)}/inertia/`,
			'config-ssr': `${getDirname(import.meta.url)}/config/ssr.ts`,
		},
	},
});
