import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button, CopyButton } from '@minimalstuff/ui';

import { cn } from '~/lib/cn';
import { urlFor } from '~/lib/tuyau';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { DashboardHeaderMeta } from '~/components/dashboard/headers/dashboard_header_meta';
import { DashboardHeaderTitle } from '~/components/dashboard/headers/dashboard_header_title';
import { DashboardHeaderActions } from '~/components/dashboard/headers/dashboard_header_actions';

export type DashboardHeaderProps = {
	isFavorite: boolean;
	onToggleSidebar: () => void;
	onCreateCollection: () => void;
	onEditCollection: () => void;
	onDeleteCollection: () => void;
	onCreateLink: () => void;
	onOpenSearch: () => void;
};

export function DashboardHeader({
	isFavorite,
	onToggleSidebar,
	onCreateCollection,
	onEditCollection,
	onDeleteCollection,
	onCreateLink,
	onOpenSearch,
}: Readonly<DashboardHeaderProps>) {
	const { activeCollection } = useDashboardProps();
	const isMobile = useIsMobile();

	const collectionDescription = activeCollection?.description ?? undefined;

	const shareUrl = activeCollection?.id
		? `${window.location.origin}${urlFor('shared', { id: activeCollection.id })}`
		: '';

	const handleUnfollow = () => {
		if (!activeCollection?.id) return;
		const unfollowUrl = urlFor('collection.unfollow', {
			id: activeCollection.id,
		});
		router.post(unfollowUrl);
	};

	return (
		<CopyButton value={shareUrl}>
			{({ copy }) => (
				<header
					className={cn(
						'md:border-b border-gray-200/50 dark:border-gray-700/50 pb-4',
						// Desktop always has a sidebar to sit beside, expanded or railed.
						isMobile ? 'pl-0' : 'p-4'
					)}
				>
					<div className="flex flex-col min-[1460px]:flex-row min-[1460px]:items-start justify-between gap-4">
						<div className="min-w-0">
							<DashboardHeaderTitle isFavorite={isFavorite} />

							{collectionDescription && (
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line break-words">
									{collectionDescription}
								</p>
							)}

							<DashboardHeaderMeta isFavorite={isFavorite} />
						</div>

						<DashboardHeaderActions
							isFavorite={isFavorite}
							onToggleSidebar={onToggleSidebar}
							onCreateCollection={onCreateCollection}
							onEditCollection={onEditCollection}
							onDeleteCollection={onDeleteCollection}
							onCreateLink={onCreateLink}
							onOpenSearch={onOpenSearch}
							onShareCollection={() => void copy()}
							onUnfollow={handleUnfollow}
						/>
					</div>

					{!isMobile && !isFavorite && activeCollection?.isOwner === false && (
						<div className="mt-4 w-full flex items-center gap-2 flex-wrap">
							<Button color="danger" onClick={handleUnfollow}>
								<Trans>Unfollow</Trans>
							</Button>
						</div>
					)}
				</header>
			)}
		</CopyButton>
	);
}
