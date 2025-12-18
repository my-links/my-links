import PATHS from '#constants/paths';
import { Trans } from '@lingui/react/macro';
import packageJson from '../../../../package.json';

export const FOOTER_LINKS = [
	{
		href: '/status',
		icon: 'i-mdi-heart-pulse',
		label: <Trans>Status</Trans>,
		internal: true,
	},
	{
		href: PATHS.REPO_GITHUB,
		icon: 'i-mdi-tag',
		label: packageJson.version,
		internal: false,
	},
	{
		href: '/privacy',
		icon: 'i-mdi-shield-lock',
		label: <Trans>Privacy</Trans>,
		internal: true,
	},
	{
		href: '/terms',
		icon: 'i-mdi-file-document',
		label: <Trans>Terms</Trans>,
		internal: true,
	},
] as const;
