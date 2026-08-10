import { t } from '@lingui/core/macro';
import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { IconButton } from '@minimalstuff/ui';
import type { PageProps } from '@adonisjs/inertia/types';

import { PROJECT_CHANGELOG_URL } from '~/consts/project';
import { ClientOnly } from '~/components/common/client_only';
import { useAnnouncementStore } from '~/stores/announcement_store';

function getMajorVersion(appVersion: string): number {
	return Number(appVersion.split('.')[0]);
}

export function AnnouncementBanner() {
	return (
		<ClientOnly>
			<AnnouncementBannerContent />
		</ClientOnly>
	);
}

function AnnouncementBannerContent() {
	const { appVersion } = usePage<PageProps & { appVersion: string }>().props;
	const dismissedMajorVersion = useAnnouncementStore(
		(state) => state.dismissedMajorVersion
	);
	const dismiss = useAnnouncementStore((state) => state.dismiss);

	const majorVersion = getMajorVersion(appVersion);

	if (dismissedMajorVersion === majorVersion) {
		return null;
	}

	return (
		<div className="flex w-full items-center justify-center gap-3 bg-brand dark:bg-brand-dark px-4 py-2 text-sm text-paper">
			<p>
				<Trans>New version {majorVersion} is here.</Trans>{' '}
				<a
					href={PROJECT_CHANGELOG_URL}
					target="_blank"
					rel="noreferrer"
					className="font-medium underline underline-offset-2 hover:no-underline"
				>
					<Trans>See what's new</Trans>
				</a>
			</p>
			<IconButton
				icon="i-ant-design-close-outlined"
				size="sm"
				variant="unstyled"
				className="text-paper hover:bg-white/10 rounded-md"
				aria-label={t`Dismiss`}
				onClick={() => dismiss(majorVersion)}
			/>
		</div>
	);
}
