import adonisjs from '@adonisjs/vite/client';
import { linguiMacroSwcPlugin } from '@lingui/swc-plugin/options';
import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		react({
			plugins: [linguiMacroSwcPlugin()],
		}),
		lingui(),
		UnoCSS(`${import.meta.dirname}/../../uno.config.ts`),
		adonisjs({
			entryPoints: ['inertia/app.tsx'],
			serverEntryPoints: ['inertia/ssr.tsx'],
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
