import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import adonisjs from '@adonisjs/vite/client';
import { lingui } from '@lingui/vite-plugin';
import { linguiMacroSwcPlugin } from '@lingui/swc-plugin/options';

export default defineConfig({
	plugins: [
		react({
			plugins: [linguiMacroSwcPlugin()],
		}),
		lingui(),
		UnoCSS(`${import.meta.dirname}/../../uno.config.ts`),
		adonisjs({
			entrypoints: ['inertia/app.tsx'],
			serverEntrypoints: ['inertia/ssr.tsx'],
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
