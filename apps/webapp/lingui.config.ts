import { defineConfig } from '@lingui/cli';

export default defineConfig({
	sourceLocale: 'en',
	locales: ['fr', 'en'],
	catalogs: [
		{
			path: './inertia/locales/{locale}/messages',
			include: ['inertia'],
		},
	],
});
