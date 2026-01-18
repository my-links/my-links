import { KEYS } from '#constants/keys';
import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { Kbd } from '~/components/common/kbd';
import { Tooltip } from '~/components/common/tooltip';
import { SearchButton } from '~/components/dashboard/search/search_button';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { useRouteHelper } from '~/lib/route_helper';
import { useDashboardLayoutStore } from '~/stores/dashboard_layout_store';
import { Visibility } from '~/types/app';

interface DashboardHeaderProps {
	isFavorite: boolean;
	onToggleSidebar: () => void;
	onCreateCollection: () => void;
	onEditCollection: () => void;
	onDeleteCollection: () => void;
	onCreateLink: () => void;
	onOpenSearch: () => void;
}

export const BurgerButton = ({
	onToggleSidebar,
}: {
	onToggleSidebar: () => void;
}) => (
	<button
		onClick={onToggleSidebar}
		className="cursor-pointer p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors flex-shrink-0 border border-gray-300/50 dark:border-gray-600/50 sm:border-0"
		aria-label="Toggle sidebar"
	>
		<div className="i-ant-design-menu-outlined w-5 h-5" />
	</button>
);

export function DashboardHeader({
	isFavorite,
	onToggleSidebar,
	onCreateCollection,
	onEditCollection,
	onDeleteCollection,
	onCreateLink,
	onOpenSearch,
}: DashboardHeaderProps) {
	const { activeCollection } = useDashboardProps();
	const { sidebarOpen } = useDashboardLayoutStore();
	const isMobile = useIsMobile();
	const collectionDescription =
		activeCollection && activeCollection.description
			? activeCollection.description
			: undefined;

	const { url: getUrl, route } = useRouteHelper();

	const handleShareCollection = async () => {
		if (!activeCollection?.id) return;
		const url = getUrl('shared', {
			params: { id: activeCollection.id },
		});
		await navigator.clipboard.writeText(url);
	};

	const handleUnfollow = () => {
		if (!activeCollection?.id) return;
		const unfollowUrl = route('collection.unfollow', {
			params: { id: activeCollection.id },
		}).url;
		router.post(
			unfollowUrl,
			{},
			{
				onSuccess: () => {
					router.reload();
				},
			}
		);
	};

	return (
		<header
			className={clsx(
				'border-b border-gray-200/50 dark:border-gray-700/50 pb-4',
				!sidebarOpen || isMobile ? 'pl-0' : 'pl-4'
			)}
		>
			<div className="flex flex-col justify-between gap-4">
				<div className="flex items-center gap-4 flex-1">
					<BurgerButton onToggleSidebar={onToggleSidebar} />

					<SearchButton onClick={onOpenSearch} />
				</div>

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
									<button
										className="cursor-pointer px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
										onClick={handleShareCollection}
									>
										<div className="i-ant-design-share-alt-outlined w-5 h-5" />
									</button>
								</Tooltip>
								<div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
							</>
						)}

						<button
							onClick={() => onCreateCollection()}
							className="cursor-pointer px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors border border-gray-300/50 dark:border-gray-600/50 sm:border-0"
						>
							<Trans>
								Create collection <Kbd>{KEYS.OPEN_CREATE_COLLECTION_KEY}</Kbd>
							</Trans>
						</button>

						{!isFavorite && activeCollection?.isOwner !== false && (
							<>
								<button
									onClick={onEditCollection}
									className="cursor-pointer px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors border border-gray-300/50 dark:border-gray-600/50 sm:border-0"
								>
									<Trans>Edit collection</Trans>
								</button>
								<button
									onClick={onDeleteCollection}
									className="cursor-pointer px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors border border-red-300/50 dark:border-red-600/50 sm:border-0"
								>
									<Trans>Delete collection</Trans>
								</button>
							</>
						)}
					</div>

					<div className="flex items-center gap-2 flex-wrap">
						{activeCollection?.isOwner !== false && (
							<button
								onClick={onCreateLink}
								className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
							>
								<Trans>
									Create link <Kbd>{KEYS.OPEN_CREATE_LINK_KEY}</Kbd>
								</Trans>
							</button>
						)}
						{!isFavorite && activeCollection?.isOwner === false && (
							<button
								onClick={handleUnfollow}
								className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors"
							>
								<Trans>Unfollow</Trans>
							</button>
						)}
					</div>
				</div>
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
