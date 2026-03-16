import type { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { PROJECT_REPO_GITHUB_URL } from '~/consts/project';

type FooterLink = {
	href: string;
	icon: string;
	label: React.ReactNode;
	internal: boolean;
	admin: boolean;
};

export const useFooterLinks = () => {
	const { appVersion } = usePage<PageProps & { appVersion: string }>().props;
	const links: FooterLink[] = [
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
			label: appVersion,
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
	];

	return links;
};
