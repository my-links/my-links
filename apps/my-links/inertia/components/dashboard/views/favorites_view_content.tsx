import { Trans } from '@lingui/react/macro';
import { FilterList } from '~/components/common/filter_list';
import { LinkList } from '~/components/dashboard/links/link_list';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { useIsMobile } from '~/hooks/use_is_mobile';

export function FavoritesViewContent() {
	const { favoriteLinks } = useDashboardProps();
	const isMobile = useIsMobile();

	const favoriteLinksCount = favoriteLinks?.length ?? 0;
	return (
		<>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
						<Trans>Favorites</Trans>
					</h1>
					{favoriteLinksCount > 0 && (
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{favoriteLinksCount}{' '}
							{favoriteLinksCount === 1 ? (
								<Trans>link</Trans>
							) : (
								<Trans>links</Trans>
							)}
						</p>
					)}
				</div>

				{!isMobile && <FilterList layoutStoreKey="dashboard" />}
			</div>

			<LinkList links={favoriteLinks} />
		</>
	);
}
