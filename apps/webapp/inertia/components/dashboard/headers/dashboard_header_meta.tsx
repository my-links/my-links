import { Trans } from '@lingui/react/macro';

import { useDashboardProps } from '~/hooks/use_dashboard_props';

type DashboardHeaderMetaProps = {
	isFavorite: boolean;
};

export function DashboardHeaderMeta({
	isFavorite,
}: Readonly<DashboardHeaderMetaProps>) {
	const { activeCollection, favoriteLinks } = useDashboardProps();

	const links = activeCollection?.links ?? [];
	const isOwner = activeCollection?.isOwner !== false;
	const isPublic = activeCollection?.visibility === 'PUBLIC';
	const followersCount = activeCollection?.followersCount ?? 0;
	const hasLinksMeta = links.length > 0;
	const hasFollowersMeta = isPublic && followersCount > 0;
	const favoriteLinksCount = favoriteLinks?.length ?? 0;

	return (
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
							{links.length === 1 ? <Trans>link</Trans> : <Trans>links</Trans>}
						</p>
					)}
					{hasFollowersMeta && (
						<>
							{hasLinksMeta && (
								<span className="text-gray-400 dark:text-gray-600">•</span>
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
								<span className="text-gray-400 dark:text-gray-600">•</span>
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
	);
}
