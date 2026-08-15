import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button, IconButton } from '@minimalstuff/ui';

import { cn } from '~/lib/cn';
import { KEYS } from '~/consts/keys';
import { urlFor } from '~/lib/tuyau';
import { Kbd } from '~/components/common/kbd';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { Tooltip } from '~/components/common/tooltip';
import { FilterList } from '~/components/common/filter_list';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { DashboardQuickAction } from '~/components/dashboard/headers/dashboard_quick_action';

export interface DashboardHeaderProps {
	isFavorite: boolean;
	onToggleSidebar: () => void;
	onCreateCollection: () => void;
	onEditCollection: () => void;
	onDeleteCollection: () => void;
	onCreateLink: () => void;
	onOpenSearch: () => void;
}

export function DashboardHeader({
	isFavorite,
	onToggleSidebar,
	onCreateCollection,
	onEditCollection,
	onDeleteCollection,
	onCreateLink,
	onOpenSearch,
}: Readonly<DashboardHeaderProps>) {
	const { activeCollection, favoriteLinks } = useDashboardProps();
	const isMobile = useIsMobile();

	const collectionDescription = activeCollection?.description ?? undefined;
	const links = activeCollection?.links ?? [];
	const isOwner = activeCollection?.isOwner !== false;
	const isPublic = activeCollection?.visibility === 'PUBLIC';
	const followersCount = activeCollection?.followersCount ?? 0;
	const hasLinksMeta = links.length > 0;
	const hasFollowersMeta = isPublic && followersCount > 0;
	const favoriteLinksCount = favoriteLinks?.length ?? 0;

	const handleShareCollection = async () => {
		if (!activeCollection?.id) return;
		const url = `${window.location.origin}${urlFor('shared', { id: activeCollection.id })}`;
		await navigator.clipboard.writeText(url);
	};

	const handleUnfollow = () => {
		if (!activeCollection?.id) return;
		const unfollowUrl = urlFor('collection.unfollow', {
			id: activeCollection.id,
		});
		router.post(unfollowUrl);
	};

	return (
		<header
			className={cn(
				'md:border-b border-gray-200/50 dark:border-gray-700/50 pb-4',
				// Desktop always has a sidebar to sit beside, expanded or railed.
				isMobile ? 'pl-0' : 'pl-4'
			)}
		>
			<div className="flex flex-col min-[1460px]:flex-row min-[1460px]:items-start justify-between gap-4">
				<div className="min-w-0">
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

					{collectionDescription && (
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line break-words">
							{collectionDescription}
						</p>
					)}

					<div className="mt-1 flex items-center gap-2 flex-wrap">
						{isFavorite ? (
							favoriteLinksCount > 0 && (
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{favoriteLinksCount}{' '}
									{favoriteLinksCount === 1 ? (
										<Trans>link</Trans>
									) : (
										<Trans>links</Trans>
									)}
								</p>
							)
						) : (
							<>
								{hasLinksMeta && (
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{links.length}{' '}
										{links.length === 1 ? (
											<Trans>link</Trans>
										) : (
											<Trans>links</Trans>
										)}
									</p>
								)}
								{hasFollowersMeta && (
									<>
										{hasLinksMeta && (
											<span className="text-gray-400 dark:text-gray-600">
												•
											</span>
										)}
										<p className="text-sm text-gray-500 dark:text-gray-400">
											{followersCount}{' '}
											{followersCount === 1 ? (
												<Trans>follower</Trans>
											) : (
												<Trans>followers</Trans>
											)}
										</p>
									</>
								)}
								{!isOwner && activeCollection?.author && (
									<>
										{(hasLinksMeta || hasFollowersMeta) && (
											<span className="text-gray-400 dark:text-gray-600">
												•
											</span>
										)}
										<p className="text-sm text-gray-500 dark:text-gray-400">
											<Trans>
												Created by <b>{activeCollection.author.fullname}</b>
											</Trans>
										</p>
									</>
								)}
							</>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2 flex-wrap flex-shrink-0">
					{/* Desktop keeps its toggle in the sidebar, which never leaves
					the screen; mobile hides the sidebar outright and needs one here. */}
					{isMobile && (
						<IconButton
							icon="i-ant-design-menu-outlined"
							onClick={onToggleSidebar}
							aria-label="Toggle sidebar"
							variant="outline"
						/>
					)}

					{!isMobile && activeCollection?.visibility === 'PUBLIC' && (
						<Tooltip
							content={<Trans>Click to copy link</Trans>}
							temporaryContent={<Trans>Copied!</Trans>}
							showOnClick
							position="bottom"
						>
							<IconButton
								icon="i-ant-design-share-alt-outlined"
								onClick={() => void handleShareCollection()}
								aria-label="Share collection"
								variant="outline"
								size="md"
							/>
						</Tooltip>
					)}

					{!isMobile && activeCollection?.isOwner !== false && (
						<Button color="primary" onClick={onCreateLink} variant="subtle">
							<Trans>
								Create link <Kbd>{KEYS.OPEN_CREATE_LINK_KEY}</Kbd>
							</Trans>
						</Button>
					)}

					{!isMobile && (
						<Button
							variant="subtle"
							onClick={onCreateCollection}
							data-tour="create-collection"
						>
							<Trans>
								Create collection <Kbd>{KEYS.OPEN_CREATE_COLLECTION_KEY}</Kbd>
							</Trans>
						</Button>
					)}

					{!isMobile && <FilterList layoutStoreKey="dashboard" />}

					{isMobile && (
						<DashboardQuickAction
							onCreateLink={onCreateLink}
							onHandleShareCollection={() => void handleShareCollection()}
							onCreateCollection={onCreateCollection}
							isFavorite={isFavorite}
							onEditCollection={onEditCollection}
							onDeleteCollection={onDeleteCollection}
							onHandleUnfollow={handleUnfollow}
							onToggleSidebar={onToggleSidebar}
							onOpenSearch={onOpenSearch}
						/>
					)}
				</div>
			</div>

			{!isMobile && !isFavorite && activeCollection?.isOwner === false && (
				<div className="mt-4 w-full flex items-center gap-2 flex-wrap">
					<Button color="danger" onClick={handleUnfollow}>
						<Trans>Unfollow</Trans>
					</Button>
				</div>
			)}
		</header>
	);
}
