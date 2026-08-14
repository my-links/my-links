import { Card } from '@minimalstuff/ui';
import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import type { PageProps } from '@adonisjs/inertia/types';

import { PROJECT_CHANGELOG_URL } from '~/consts/project';
import { IconLink } from '~/components/common/navigation/icon_link';

export function About() {
	const { appVersion } = usePage<PageProps & { appVersion: string }>().props;

	return (
		<Card
			title={<Trans>About</Trans>}
			description={
				<Trans>Which version you are on, and the terms you agreed to.</Trans>
			}
		>
			<div className="space-y-1">
				<IconLink href={PROJECT_CHANGELOG_URL} icon="i-mdi-tag" external>
					<Trans>Version {appVersion}</Trans>
				</IconLink>
				<IconLink href="/privacy" icon="i-mdi-shield-lock">
					<Trans>Privacy</Trans>
				</IconLink>
				<IconLink href="/terms" icon="i-mdi-file-document">
					<Trans>Terms</Trans>
				</IconLink>
			</div>
		</Card>
	);
}
