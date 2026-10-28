import { defineConfig } from 'vitepress';

const frenchSearchTranslations = {
	button: { buttonText: 'Rechercher', buttonAriaLabel: 'Rechercher' },
	modal: {
		displayDetails: 'Afficher le détail',
		resetButtonTitle: 'Réinitialiser la recherche',
		backButtonTitle: 'Fermer la recherche',
		noResultsText: 'Aucun résultat pour',
		footer: {
			selectText: 'sélectionner',
			selectKeyAriaLabel: 'entrée',
			navigateText: 'naviguer',
			navigateUpKeyAriaLabel: 'flèche du haut',
			navigateDownKeyAriaLabel: 'flèche du bas',
			closeText: 'fermer',
			closeKeyAriaLabel: 'échap',
		},
	},
};

export default defineConfig({
	title: 'MyLinks',
	cleanUrls: true,
	lastUpdated: true,

	head: [['link', { rel: 'icon', href: '/favicon.svg' }]],

	themeConfig: {
		logo: '/logo-light.svg',
		siteTitle: false,

		search: {
			provider: 'local',
			options: { locales: { fr: { translations: frenchSearchTranslations } } },
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/my-links/my-links' },
		],
	},

	locales: {
		root: {
			label: 'English',
			lang: 'en-US',
			description:
				'Documentation for MyLinks, a self-hostable bookmark manager.',
			themeConfig: {
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
								{
									text: 'Authentication',
									link: '/self-hosting/authentication',
								},
								{
									text: 'Console commands',
									link: '/self-hosting/console-commands',
								},
								{
									text: 'Administration',
									link: '/self-hosting/administration',
								},
								{ text: 'Data & privacy', link: '/self-hosting/privacy' },
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
								{ text: 'Sync', link: '/api/sync' },
								{ text: 'Tokens', link: '/api/tokens' },
								{ text: 'Health', link: '/api/health' },
								{ text: 'MCP server', link: '/api/mcp' },
								{ text: 'Non-API routes', link: '/api/non-api-routes' },
								{ text: 'Error responses', link: '/api/error-responses' },
								{ text: 'Data types', link: '/api/data-types' },
							],
						},
					],
				},

				editLink: {
					pattern: 'https://github.com/my-links/my-links/edit/main/docs/:path',
					text: 'Edit this page on GitHub',
				},

				footer: {
					message: 'Released under the AGPLv3 License.',
					copyright: 'MyLinks is free and open-source software.',
				},
			},
		},
		fr: {
			label: 'Français',
			lang: 'fr-FR',
			link: '/fr/',
			description:
				'Documentation de MyLinks, un gestionnaire de favoris auto-hébergeable.',
			themeConfig: {
				nav: [
					{
						text: 'Guide',
						link: '/fr/guide/introduction',
						activeMatch: '/fr/guide/',
					},
					{
						text: 'Auto-hébergement (en anglais)',
						link: '/self-hosting/docker',
					},
					{ text: "Référence de l'API (en anglais)", link: '/api/' },
					{
						text: 'Journal des modifications (en anglais)',
						link: '/changelog',
					},
					{ text: 'Contribuer (en anglais)', link: '/contributing' },
					{ text: 'mylinks.app', link: 'https://www.mylinks.app' },
				],

				sidebar: {
					'/fr/guide/': [
						{
							text: 'Guide',
							items: [
								{ text: 'Introduction', link: '/fr/guide/introduction' },
								{ text: 'Utiliser MyLinks', link: '/fr/guide/using-mylinks' },
								{ text: 'Compte', link: '/fr/guide/account' },
								{
									text: 'Extension de navigateur',
									link: '/fr/guide/browser-extension',
								},
							],
						},
					],
				},

				editLink: {
					pattern: 'https://github.com/my-links/my-links/edit/main/docs/:path',
					text: 'Modifier cette page sur GitHub',
				},

				footer: {
					message: 'Publié sous licence AGPLv3.',
					copyright: 'MyLinks est un logiciel libre et open source.',
				},

				docFooter: { prev: 'Page précédente', next: 'Page suivante' },
				outline: { label: 'Sur cette page' },
				lastUpdated: { text: 'Dernière mise à jour' },
				darkModeSwitchLabel: 'Apparence',
				lightModeSwitchTitle: 'Passer au thème clair',
				darkModeSwitchTitle: 'Passer au thème sombre',
				sidebarMenuLabel: 'Menu',
				returnToTopLabel: 'Retour en haut',
				langMenuLabel: 'Changer de langue',
				skipToContentLabel: 'Aller au contenu',
			},
		},
	},
});
