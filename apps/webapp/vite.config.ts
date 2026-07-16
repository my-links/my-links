import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inertia from '@adonisjs/inertia/vite';
import adonisjs from '@adonisjs/vite/client';
import { lingui } from '@lingui/vite-plugin';

export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: ['@lingui/babel-plugin-lingui-macro'],
			},
		}),
		lingui(),
		UnoCSS(`${import.meta.dirname}/../../uno.config.ts`),
		inertia({ ssr: { enabled: true, entrypoint: 'inertia/ssr.tsx' } }),
		adonisjs({
			entrypoints: [`${import.meta.dirname}/inertia/app.tsx`],
			reload: ['resources/views/**/*.edge'],
		}),
	],

	resolve: {
		alias: {
			'~/': `${import.meta.dirname}/inertia/`,
			'config-ssr': `${import.meta.dirname}/config/ssr.ts`,
			'@generated': `${import.meta.dirname}/.adonisjs/client/`,
		},
	},
});
