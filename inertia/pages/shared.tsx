import { ReactNode } from 'react';
import CollectionHeader from '~/components/dashboard/collection/header/collection_header';
import LinkList from '~/components/dashboard/link/link_list';
import ContentLayout from '~/components/layouts/content_layout';
import { ActiveCollectionContext } from '~/contexts/active_collection_context';
import { CollectionWithLinks } from '~/types/app';

const SharedCollectionPage = ({
	collection,
}: {
	collection: CollectionWithLinks;
}) => (
	<ActiveCollectionContext.Provider
		value={{ activeCollection: collection, setActiveCollection: () => {} }}
	>
		<CollectionHeader showButtons={false} showControls={false} />
		<LinkList links={collection.links} showControls={false} />
	</ActiveCollectionContext.Provider>
);

SharedCollectionPage.layout = (page: ReactNode) => (
	<ContentLayout css={{ width: '900px' }} children={page} />
);
export default SharedCollectionPage;
