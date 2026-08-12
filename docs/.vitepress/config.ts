import { defineConfig } from 'vitepress';

export default defineConfig({
	title: 'MyLinks',
	description: 'Documentation for MyLinks, a self-hostable bookmark manager.',
	lang: 'en-US',
	cleanUrls: true,
	lastUpdated: true,

	head: [['link', { rel: 'icon', href: '/favicon.svg' }]],

	themeConfig: {
		logo: '/logo-light.svg',
		siteTitle: false,

		nav: [
			{ text: 'Guide', link: '/guide/introduction' },
			{ text: 'Self-hosting', link: '/self-hosting/docker' },
			{ text: 'API reference', link: '/api/' },
			{ text: 'Changelog', link: '/changelog' },
			{ text: 'Contributing', link: '/contributing' },
			{ text: 'mylinks.app', link: 'https://www.mylinks.app' },
		],

		sidebar: {
			'/guide/': [
				{
					text: 'Guide',
					items: [
						{ text: 'Introduction', link: '/guide/introduction' },
						{ text: 'Using MyLinks', link: '/guide/using-mylinks' },
						{ text: 'Account', link: '/guide/account' },
						{ text: 'Browser extension', link: '/guide/browser-extension' },
					],
				},
			],
			'/self-hosting/': [
				{
					text: 'Self-hosting',
					items: [
						{ text: 'Docker & compose', link: '/self-hosting/docker' },
						{ text: 'Configuration', link: '/self-hosting/configuration' },
						{ text: 'Authentication', link: '/self-hosting/authentication' },
						{
							text: 'Console commands',
							link: '/self-hosting/console-commands',
						},
						{ text: 'Administration', link: '/self-hosting/administration' },
					],
				},
			],
			'/api/': [
				{
					text: 'API reference',
					items: [
						{ text: 'Overview', link: '/api/' },
						{ text: 'Collections', link: '/api/collections' },
						{ text: 'Links', link: '/api/links' },
						{ text: 'Search', link: '/api/search' },
						{ text: 'Sync', link: '/api/sync' },
						{ text: 'Tokens', link: '/api/tokens' },
						{ text: 'Health', link: '/api/health' },
						{ text: 'Non-API routes', link: '/api/non-api-routes' },
						{ text: 'Error responses', link: '/api/error-responses' },
						{ text: 'Data types', link: '/api/data-types' },
					],
				},
			],
		},

		search: {
			provider: 'local',
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/my-links/my-links' },
		],

		editLink: {
			pattern: 'https://github.com/my-links/my-links/edit/main/docs/:path',
			text: 'Edit this page on GitHub',
		},

		footer: {
			message: 'Released under the AGPLv3 License.',
			copyright: 'MyLinks is free and open-source software.',
		},
	},
});
