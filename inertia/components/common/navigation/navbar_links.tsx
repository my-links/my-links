import {
	PROJECT_EXTENSION_URL,
	PROJECT_REPO_GITHUB_URL,
} from '#config/project';

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
] as const;

