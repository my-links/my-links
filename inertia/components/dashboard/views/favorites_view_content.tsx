import { Link } from '#shared/types/dto';
import { Trans } from '@lingui/react/macro';
import { FilterList } from '~/components/common/filter_list';
import { LinkList } from '~/components/dashboard/links/link_list';
import { useIsMobile } from '~/hooks/use_is_mobile';

interface FavoritesViewContentProps {
	favoriteLinks: Link[];
}

export function FavoritesViewContent({
	favoriteLinks,
}: FavoritesViewContentProps) {
	const isMobile = useIsMobile();

	return (
		<>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
						<Trans>Favorites</Trans>
					</h1>
					{favoriteLinks.length > 0 && (
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{favoriteLinks.length}{' '}
							{favoriteLinks.length === 1 ? (
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
