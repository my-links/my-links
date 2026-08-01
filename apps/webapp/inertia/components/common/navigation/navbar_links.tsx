import {
	PROJECT_DOCS_URL,
	PROJECT_EXTENSION_URL,
	PROJECT_REPO_GITHUB_URL,
} from '~/consts/project';

export const NAVBAR_LINKS = [
	{
		label: 'Github',
		href: PROJECT_REPO_GITHUB_URL,
		icon: 'i-mdi-github',
	},
	{
		label: 'Extension',
		href: PROJECT_EXTENSION_URL,
		icon: 'i-mdi-extension',
	},
	{
		label: 'Docs',
		href: PROJECT_DOCS_URL,
		icon: 'i-mdi-book-open-variant',
	},
] as const;
