import { CollectionWithLinks } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { CollapsibleSection } from './collapsible_section';

interface PagePropsWithCollections extends PageProps {
	followedCollections: CollectionWithLinks[];
	myPublicCollections: CollectionWithLinks[];
	myPrivateCollections: CollectionWithLinks[];
}

export function CollectionList() {
	const { props } = usePage<PagePropsWithCollections>();
	const {
		followedCollections = [],
		myPublicCollections = [],
		myPrivateCollections = [],
	} = props;

	const sectionsCount = [
		followedCollections.length > 0,
		myPublicCollections.length > 0,
		myPrivateCollections.length > 0,
	].filter(Boolean).length;
	const canCollapse = sectionsCount > 1;

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-y-auto space-y-1 px-2">
				<CollapsibleSection
					title={<Trans>Followed Collections</Trans>}
					collections={followedCollections}
					canCollapse={canCollapse}
				/>
				<CollapsibleSection
					title={<Trans>My Public Collections</Trans>}
					collections={myPublicCollections}
					canCollapse={canCollapse}
				/>
				<CollapsibleSection
					title={<Trans>My Private Collections</Trans>}
					collections={myPrivateCollections}
					canCollapse={canCollapse}
					alwaysShow
				/>
			</div>
		</div>
	);
}
