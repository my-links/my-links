import {
	PROJECT_DOCS_URL,
	PROJECT_EXTENSION_CHROME_URL,
	PROJECT_EXTENSION_FIREFOX_URL,
	PROJECT_REPO_GITHUB_URL,
} from '~/consts/project';

export const NAVBAR_LINKS = [
	{
		label: 'Github',
		href: PROJECT_REPO_GITHUB_URL,
		icon: 'i-mdi-github',
	},
	{
		label: 'Chrome',
		href: PROJECT_EXTENSION_CHROME_URL,
		icon: 'i-mdi-google-chrome',
	},
	{
		label: 'Firefox',
		href: PROJECT_EXTENSION_FIREFOX_URL,
		icon: 'i-mdi-firefox',
	},
	{
		label: 'Docs',
		href: PROJECT_DOCS_URL,
		icon: 'i-mdi-book-open-variant',
	},
] as const;
