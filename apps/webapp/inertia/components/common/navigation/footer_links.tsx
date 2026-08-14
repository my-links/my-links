import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import type { PageProps } from '@adonisjs/inertia/types';

import { PROJECT_REPO_GITHUB_URL } from '~/consts/project';

type FooterLink = {
	href: string;
	icon: string;
	label: React.ReactNode;
	internal: boolean;
};

export const useFooterLinks = (): FooterLink[] => {
	const { appVersion } = usePage<PageProps & { appVersion: string }>().props;

	return [
		{
			href: PROJECT_REPO_GITHUB_URL,
			icon: 'i-mdi-tag',
			label: appVersion,
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
	];
};
