import type { ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Card, ThemeToggle } from '@minimalstuff/ui';

import { LocaleSwitcher } from '~/components/common/locale_switcher';

interface PreferenceRowProps {
	label: ReactNode;
	description: ReactNode;
	control: ReactNode;
}

const PreferenceRow = ({
	label,
	description,
	control,
}: Readonly<PreferenceRowProps>) => (
	<div className="flex items-center justify-between gap-4">
		<div>
			<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
				{label}
			</p>
			<p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
		</div>
		{control}
	</div>
);

export const Preferences = () => (
	<Card
		title={<Trans>Preferences</Trans>}
		description={
			<Trans>
				Language is kept in a cookie and the theme in this browser's storage, so
				both apply to this device only.
			</Trans>
		}
	>
		<div className="space-y-4">
			<PreferenceRow
				label={<Trans>Language</Trans>}
				description={<Trans>The language MyLinks speaks to you in.</Trans>}
				control={<LocaleSwitcher />}
			/>
			<PreferenceRow
				label={<Trans>Theme</Trans>}
				description={<Trans>Switch between the light and dark palette.</Trans>}
				control={<ThemeToggle />}
			/>
		</div>
	</Card>
);
