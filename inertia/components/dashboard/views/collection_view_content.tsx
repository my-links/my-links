import { Trans } from '@lingui/react/macro';
import { FilterList } from '~/components/common/filter_list';
import { LinkList } from '~/components/dashboard/links/link_list';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { useIsMobile } from '~/hooks/use_is_mobile';

export function CollectionViewContent() {
	const isMobile = useIsMobile();
	const { activeCollection } = useDashboardProps();
	const links = activeCollection?.links ?? [];
	const isOwner = activeCollection?.isOwner !== false;

	return (
		<>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
						{activeCollection?.icon && (
							<span className="text-2xl">{activeCollection.icon}</span>
						)}
						{activeCollection?.name}
					</h1>
					<div className="mt-1 flex items-center gap-2">
						{links.length > 0 && (
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{links.length}{' '}
								{links.length === 1 ? (
									<Trans>link</Trans>
								) : (
									<Trans>links</Trans>
								)}
							</p>
						)}
						{!isOwner && activeCollection?.author && (
							<>
								{links.length > 0 && (
									<span className="text-gray-400 dark:text-gray-600">•</span>
								)}
								<p className="text-sm text-gray-500 dark:text-gray-400">
									<Trans>
										Created by <b>{activeCollection.author.fullname}</b>
									</Trans>
								</p>
							</>
						)}
					</div>
				</div>

				{!isMobile && <FilterList layoutStoreKey="dashboard" />}
			</div>

			<LinkList links={links} />
		</>
	);
}
