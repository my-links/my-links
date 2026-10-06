import { Trans } from '@lingui/react/macro';

import { useDashboardProps } from '~/hooks/use_dashboard_props';

type DashboardHeaderTitleProps = {
	isFavorite: boolean;
};

export function DashboardHeaderTitle({
	isFavorite,
}: Readonly<DashboardHeaderTitleProps>) {
	const { activeCollection } = useDashboardProps();

	return (
		<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
			{isFavorite ? (
				<Trans>Favorites</Trans>
			) : (
				<>
					{activeCollection?.icon && (
						<span className="text-2xl">{activeCollection.icon}</span>
					)}
					{activeCollection?.name}
				</>
			)}
		</h1>
	);
}
