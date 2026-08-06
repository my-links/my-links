import clsx from 'clsx';
import { t } from '@lingui/core/macro';
import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button, IconButton } from '@minimalstuff/ui';

import { KEYS } from '~/consts/keys';
import { urlFor } from '~/lib/tuyau';
import { Visibility } from '~/types/app';
import { Kbd } from '~/components/common/kbd';
import { useTourStore } from '~/stores/tour_store';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { Tooltip } from '~/components/common/tooltip';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { useDashboardLayoutStore } from '~/stores/dashboard_layout_store';
import { SearchButton } from '~/components/dashboard/search/search_button';
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
	const { activeCollection } = useDashboardProps();
	const { sidebarOpen } = useDashboardLayoutStore();
	const { startTour } = useTourStore();
	const isMobile = useIsMobile();
	const collectionDescription = activeCollection?.description ?? undefined;

	const handleShareCollection = async () => {
		if (!activeCollection?.id) return;
		const url = urlFor('shared', { id: activeCollection.id });
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
			className={clsx(
				'md:border-b border-gray-200/50 dark:border-gray-700/50 pb-4',
				!sidebarOpen || isMobile ? 'pl-0' : 'pl-4'
			)}
		>
			<div className="flex flex-col justify-between gap-4">
				<div className="flex items-center gap-4 flex-1">
					<IconButton
						icon="i-ant-design-menu-outlined"
						onClick={onToggleSidebar}
						aria-label="Toggle sidebar"
						variant="outline"
					/>

					<SearchButton onClick={onOpenSearch} data-tour="header-search" />

					{!isMobile && (
						<Tooltip content={<Trans>Replay the tour</Trans>} position="bottom">
							<IconButton
								icon="i-ant-design-question-circle-outlined"
								onClick={() => startTour()}
								aria-label={t`Replay the tour`}
								variant="ghost"
								color="primary"
							/>
						</Tooltip>
					)}

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

				{!isMobile && (
					<div className="w-full flex items-center justify-between gap-2 flex-wrap">
						<div className="flex items-center gap-2 flex-wrap">
							{activeCollection?.visibility === Visibility.PUBLIC && (
								<>
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
									<div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
								</>
							)}

							<Button
								variant="subtle"
								size="sm"
								onClick={() => onCreateCollection()}
								data-tour="create-collection"
							>
								<Trans>
									Create collection{' '}
									{!isMobile && <Kbd>{KEYS.OPEN_CREATE_COLLECTION_KEY}</Kbd>}
								</Trans>
							</Button>

							{!isFavorite &&
								activeCollection?.isOwner !== false &&
								!activeCollection?.isDefault && (
									<>
										<Button
											variant="ghost"
											size="sm"
											onClick={onEditCollection}
										>
											<Trans>Edit collection</Trans>
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={onDeleteCollection}
											className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
										>
											<Trans>Delete collection</Trans>
										</Button>
									</>
								)}
						</div>

						<div className="flex items-center gap-2 flex-wrap">
							{activeCollection?.isOwner !== false && (
								<Button
									color="primary"
									size="sm"
									onClick={onCreateLink}
									data-tour="create-link"
								>
									<Trans>
										Create link{' '}
										{!isMobile && <Kbd>{KEYS.OPEN_CREATE_LINK_KEY}</Kbd>}
									</Trans>
								</Button>
							)}
							{!isFavorite && activeCollection?.isOwner === false && (
								<Button color="danger" onClick={handleUnfollow}>
									<Trans>Unfollow</Trans>
								</Button>
							)}
						</div>
					</div>
				)}
			</div>

			{collectionDescription && (
				<div className="mt-4">
					<p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line break-words">
						{collectionDescription}
					</p>
				</div>
			)}
		</header>
	);
}
