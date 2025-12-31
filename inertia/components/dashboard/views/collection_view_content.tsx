import { CollectionWithLinks } from '#shared/types/dto';
import { Trans } from '@lingui/react/macro';
import { FilterList } from '~/components/common/filter_list';
import { LinkList } from '~/components/dashboard/links/link_list';
import { useIsMobile } from '~/hooks/use_is_mobile';

interface CollectionViewContentProps {
	collection: CollectionWithLinks;
}

export function CollectionViewContent({
	collection,
}: CollectionViewContentProps) {
	const isMobile = useIsMobile();
	const links = collection.links ?? [];
	const isOwner = collection.isOwner !== false;

	return (
		<>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
						{collection.name}
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
						{!isOwner && collection.author && (
							<>
								{links.length > 0 && (
									<span className="text-gray-400 dark:text-gray-600">•</span>
								)}
								<p className="text-sm text-gray-500 dark:text-gray-400">
									<Trans>
										Created by <b>{collection.author.fullname}</b>
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
