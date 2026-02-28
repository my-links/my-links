import { Trans } from '@lingui/react/macro';
import { PROJECT_REPO_GITHUB_URL } from '~/consts/project';
// TODO: Fix this import
import packageJson from '../../../../package.json';

export const FOOTER_LINKS = [
	{
		href: '/admin/status',
		icon: 'i-mdi-heart-pulse',
		label: <Trans>Status</Trans>,
		internal: true,
		admin: true,
	},
	{
		href: PROJECT_REPO_GITHUB_URL,
		icon: 'i-mdi-tag',
		label: packageJson.version,
		internal: false,
		admin: false,
	},
	{
		href: '/privacy',
		icon: 'i-mdi-shield-lock',
		label: <Trans>Privacy</Trans>,
		internal: true,
		admin: false,
	},
	{
		href: '/terms',
		icon: 'i-mdi-file-document',
		label: <Trans>Terms</Trans>,
		internal: true,
		admin: false,
	},
] as const;
