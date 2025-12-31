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
	console.log(links);

	return (
		<>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
						{collection.name}
					</h1>
					{links.length > 0 && (
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{links.length}{' '}
							{links.length === 1 ? <Trans>link</Trans> : <Trans>links</Trans>}
						</p>
					)}
				</div>

				{!isMobile && <FilterList layoutStoreKey="dashboard" />}
			</div>

			<LinkList links={links} />
		</>
	);
}
