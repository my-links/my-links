import { getDirname } from '@adonisjs/core/helpers';
import inertia from '@adonisjs/inertia/client';
import adonisjs from '@adonisjs/vite/client';
import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: ['@lingui/babel-plugin-lingui-macro'],
			},
		}),
		lingui(),
		UnoCSS(),
		inertia({ ssr: { enabled: true, entrypoint: 'inertia/app/ssr.tsx' } }),
		adonisjs({
			entrypoints: [`${getDirname(import.meta.url)}/inertia/app/app.tsx`],
			reload: ['resources/views/**/*.edge'],
		}),
	],

	resolve: {
		alias: {
			'~/': `${getDirname(import.meta.url)}/inertia/`,
			'config-ssr': `${getDirname(import.meta.url)}/config/ssr.ts`,
		},
	},
});
