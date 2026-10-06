import { router } from '@inertiajs/react';
import type { ChangeEvent, ReactNode } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Card, Select, ThemeToggle } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { LocaleSwitcher } from '~/components/common/locale_switcher';
import {
	LANDING_PAGES,
	isLandingPage,
	type LandingPage,
	useLandingPageSettings,
} from '~/hooks/use_landing_page_settings';

type PreferenceRowProps = {
	label: ReactNode;
	description: ReactNode;
	control: ReactNode;
};

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

export function Preferences() {
	const { t } = useLingui();
	const { defaultLandingPage } = useLandingPageSettings();

	const landingPageLabels: Record<LandingPage, string> = {
		favorites: t`Favorites`,
		inbox: t`Inbox`,
	};
	const landingPageOptions = LANDING_PAGES.map((landingPage) => ({
		value: landingPage,
		label: landingPageLabels[landingPage],
	}));

	const handleLandingPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { value } = event.target;
		if (!isLandingPage(value)) return;

		router.put(
			urlFor('user.settings.landing_page'),
			{ defaultLandingPage: value },
			{ preserveScroll: true }
		);
	};

	return (
		<Card
			title={<Trans>Preferences</Trans>}
			description={
				<Trans>
					Language and theme apply to this device only. The default page follows
					your account.
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
					description={
						<Trans>Switch between the light and dark palette.</Trans>
					}
					control={<ThemeToggle />}
				/>
				<PreferenceRow
					label={<Trans>Default page</Trans>}
					description={
						<Trans>
							Where MyLinks opens after you sign in. Favorites falls back to the
							Inbox while you have none.
						</Trans>
					}
					control={
						<Select
							options={landingPageOptions}
							value={defaultLandingPage}
							onChange={handleLandingPageChange}
							aria-label={t`Default page`}
						/>
					}
				/>
			</div>
		</Card>
	);
}
